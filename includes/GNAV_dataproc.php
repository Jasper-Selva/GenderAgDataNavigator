<?php
defined( 'ABSPATH' ) or die( 'No direct access allowed!' );
// ************************ //
// ** initializing stuff ** //
// ************************ //
ini_set('display_errors', 'Off');
error_reporting(E_ALL | E_STRICT); 
$reqFile = "";
class GNAV_DATA_PROCESSOR{
	private $GNAV_PREFIX = "";
	private $GNAV_SCHEMA = "";
	function __construct($xls_reader, $db_prefix){
		$this->GNAV_PREFIX=$db_prefix;
	}
	function __destruct(){
	}
	
	public function getMyData(){
		$result = $this->getData();
		if(FALSE!==$result  && null!==$result){wp_send_json($result);}
		else{wp_send_json_error("error while processing request");}
	}
	/*************************************/
	/**************get data***************/
	/*************************************/
	private function getData(){
		// Selection functions: getting data allowed by all
		if(isset($_POST["GNAV_SELECT_AllScores"])){return $this->getAllScores();}
		if(isset($_POST["GNAV_SELECT_totalTree"])){return $this->getFullScoreHA();}
		if(isset($_POST["GNAV_SELECT_allSurvey"])){return $this->getAllPublishedSurveys();}
		if(isset($_POST["GNAV_SELECT_DisplayOrder"])){return $this->getDisplayOrder();}
		if(isset($_POST["GNAV_SELECT_getMetaDefs"])){return $this->getMetaDefs();}
		if(isset($_POST["GNAV_SELECT_getGEO_JSON"])) { return $this->getGNAV_GEO_JSON();}
		if(isset($_POST["GNAV_SELECT_surveyMetaValues"]) && !empty($_POST["GNAV_SELECT_surveyMetaValues"])){ return $this->getMetaValues();}
		if(isset($_POST["GNAV_SELECT_allDefs"])){return $this->getAllDefs();}
		if(isset($_POST["GNAV_admin_allSurvey"])) {return $this->getAllSurveys();}
		if(isset($_POST["GNAV_admin_getScoreDefs"])) {return $this->getScoreDefs();}
		if(isset($_POST["GNAV_admin_getAllOrganizations"])){ return $this->getAllOrganizations();}
		if(isset($_POST["GNAV_admin_getAllCountries"])){ return $this->getAllCountries();}
		if(isset($_POST["GNAV_admin_allDefs"])){return $this->getAllDefs();}
		if(isset($_POST["GNAV_admin_getSurveys"]) && !empty($_POST["GNAV_admin_getSurveys"])){ return $this->getSurveys();}
		if(isset($_POST["GNAV_admin_getScoreHA"])) {return $this->getFullScoreHA();}
		if(isset($_POST["GNAV_admin_getScoreCatDefs"])) {return $this->getScoreCatDefs();}
		if(isset($_POST["GNAV_admin_getScoreCatSU"])) {return $this->getScoreCatSU();}
		if(isset($_POST["GNAV_admin_surveyValues"]) && !empty($_POST["GNAV_admin_surveyValues"])){ return $this->getSurveyValues();}
		if(isset($_POST["GNAV_SELECT_SELECTION"]) && !empty($_POST["GNAV_SELECT_SELECTION"])){ return $this->getSurveysBySelection();}
		if(isset($_POST["GNAV_SELECT_SurveyScores"]) && !empty($_POST["GNAV_SELECT_SurveyScores"])){ return $this->getGNAV_SurveyScores();}
		if(isset($_POST["GNAV_SELECT_getCountries"]) && !empty($_POST["GNAV_SELECT_getCountries"])){ return $this->getGNAV_SurveyCountries();}
		if(isset($_POST["GNAV_admin_getAllMeta"])) {return $this->getAllMetaCats();}
		if(isset($_POST["GNAV_admin_allSurveyValues"]) && !empty($_POST["GNAV_admin_allSurveyValues"]) && isset($_POST["GNAV_admin_sVersion"]) && !empty($_POST["GNAV_admin_sVersion"])){
			return  $this->getGNAV_AllSurveyScores();
		}
		$myUser = $this->get_current_user();
		$myUserID = $myUser->ID; 
		if($myUserID===0){ return 'unknown request';}
		else{
			$myRights = $this->getUserRights($myUser);
			if(isset($_POST["GNAV_ADMIN_Data_upload"]) && !empty($_POST["GNAV_ADMIN_Data_upload"])){return $this->dataUpload(); }
			if(isset($_POST["GNAV_admin_AddVersion"]) && !empty($_POST["GNAV_admin_AddVersion"])){return $this->addSurveyDSVersion();}  
			if(isset($_POST["GNAV_admin_add_survey"]) && !empty($_POST["GNAV_admin_add_survey"])){return $this->addSurvey();}  
			// modify new/in process datasets only.
			if(isset($_POST["GNAV_admin_SC"]) && !empty($_POST["changeData"])){ return $this->processSingleChange();}
			if(isset($_POST["GNAV_admin_SMC"]) && !empty($_POST["changeData"])){ return $this->processSingleMetaChange();}
			if(isset($_POST["GNAV_admin_update_defs"])){return $this->updateDEFS();}
			// change status of surveys
			if(FALSE !== $myRights->gnav_allow_accept_reject){
				if(isset($_POST["GNAV_admin_reject_survey"]) && !empty($_POST["GNAV_admin_reject_survey"])){ return $this->reject_survey();}
				if(isset($_POST["GNAV_admin_accept_survey"]) && !empty($_POST["GNAV_admin_accept_survey"])){ return $this->accept_survey();}
				if(isset($_POST["GNAV_admin_change_survey_status"]) && !empty($_POST["GNAV_admin_change_survey_status"])){ return $this->change_survey_status();}
				if(isset($_POST["GNAV_admin_publish_survey"]) && !empty($_POST["GNAV_admin_publish_survey"])){ return $this->publish_survey();}
				if(isset($_POST["GNAV_admin_hide_survey"]) && !empty($_POST["GNAV_admin_hide_survey"])){ return $this->hide_survey();}
				if(isset($_POST["GNAV_admin_change_version_status"]) && !empty($_POST["GNAV_admin_change_version_status"])){return $this->change_version_status();}
				if(isset($_POST["GNAV_admin_reject_version"]) && !empty($_POST["GNAV_admin_reject_version"])){ return $this->reject_version();}
			}
			if(FALSE !== $myRights->gnav_allow_mod_users){
				if(isset($_POST["GNAV_UADMIN_getAllCUSERS"])){ return $this->getAllUsers();}
				if(isset($_POST["GNAV_UADMIN_getSearchUser"])&& !empty($_POST["GNAV_UADMIN_getSearchUser"])){ return $this->getUserByString();}  
				if(isset($_POST["GNAV_UADMIN_getUserByID"])&& !empty($_POST["GNAV_UADMIN_getUserByID"])){ return $this->getUserByIDPOST();}  
				if(isset($_POST["GNAV_UADMIN_setUserRights"])&& !empty($_POST["GNAV_UADMIN_setUserRights"])){ return $this->setUserRights();} 
			}
		}
	}
	/************************************/
	/************GNAV_SELECT*************/
	/************************************/
	private function getAllPublishedSurveys(){
		$p=$this->GNAV_PREFIX;		
		$sql = "SELECT VS.SID, VS.SVERSION, SN.GNAV_VALUE as surveyName FROM 
				(SELECT SID, max(SVERSION) as SVERSION FROM ".$p."GNAV_SVERSIONS GROUP BY SID, version_status HAVING version_status='publish') VS
				LEFT JOIN (SELECT SID, SURVEY_STATUS, created_at, create_user, remarks FROM ".$p."GNAV_SURVEYS WHERE SURVEY_STATUS='publish') SV ON VS.SID = SV.SID 
				LEFT JOIN (SELECT SID, SVERSION, GNAV_VALUE FROM ".$p."GNAV_SURVEY_DATA WHERE GNAV_MCAT='surveyName') SN ON VS.SID = SN.SID AND VS.SVERSION=SN.SVERSION
				WHERE SV.SID IS NOT NULL ORDER BY SN.GNAV_VALUE;";
		global $wpdb;
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getAllScores(){
		$p=$this->GNAV_PREFIX;
		$sql_data="SELECT DISTINCT 
			DT.GNAV_VALUE, 
			CASE DT.GNAV_VALUE_TYPE
				WHEN 'GNAV_SVAL' THEN VDEF.GNAV_DESCRIPTION
				WHEN 'long_text' THEN DTLT.GNAV_VALUE
				WHEN 'general_text' THEN DT.GNAV_VALUE
				ELSE ifnull(VDEFO.GNAV_DESCRIPTION, DT.GNAV_VALUE)
			END 
				AS GNAV_DESCRIPTION,
			DT.GNAV_VALUE_TYPE, DT.GNAV_SCAT, DT.GNAV_DCAT, DT.GNAV_YNQUESTION, YNDEF.GNAV_DESCRIPTION as GNAV_YNQUESTION_DESC, DT.GNAV_MCAT  
			FROM (SELECT SV.SID, VS.max_publish_version as SVERSION 
				FROM (SELECT SID FROM ".$p."GNAV_SURVEYS WHERE SURVEY_STATUS='publish') SV
			LEFT JOIN (SELECT SID, max(SVERSION) as max_publish_version FROM ".$p."GNAV_SVERSIONS GROUP BY SID, version_status HAVING version_status='publish') VS ON SV.SID=VS.SID) SVS
			LEFT JOIN (SELECT SID, SVERSION, GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_SCAT, GNAV_DCAT, GNAV_YNQUESTION,  GNAV_MCAT, GNAV_REMARKS FROM ".$p."GNAV_SURVEY_DATA WHERE GNAV_SCAT IS NOT NULL AND GNAV_LANGUAGE='@EN' ) DT ON SVS.SID=DT.SID AND SVS.SVERSION=DT.SVERSION 
			LEFT JOIN (SELECT GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_VALUE' AND LANGUAGE='@EN') VDEF ON DT.GNAV_VALUE=VDEF.GNAV_VALUE AND DT.GNAV_DCAT=VDEF.GNAV_VALUE_TYPE
			LEFT JOIN (SELECT GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_VALUE' AND LANGUAGE='@EN') VDEFO ON DT.GNAV_VALUE=VDEFO.GNAV_VALUE AND DT.GNAV_VALUE_TYPE=VDEFO.GNAV_VALUE_TYPE
			LEFT JOIN (SELECT GNAV_VALUE_ID, GNAV_VALUE FROM ".$p."GNAV_SURVEY_DATA_LT) DTLT ON DT.GNAV_VALUE=DTLT.GNAV_VALUE_ID
			LEFT JOIN (SELECT GNAV_VALUE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='YNQuestion' AND LANGUAGE='@EN') YNDEF ON DT.GNAV_YNQUESTION=YNDEF.GNAV_VALUE
			ORDER BY DT.GNAV_SCAT, DT.GNAV_DCAT, DT.GNAV_VALUE;";
		global $wpdb;
		$wpdb->show_errors();
		$res = $wpdb->get_results($sql_data,OBJECT);
		return $res;
	}
	private function getFullScoreHA(){
		$p=$this->GNAV_PREFIX;		
		$sql = "SELECT HA.GNAV_SCAT, HA.SCORE_PARENT, DF.GNAV_DESCRIPTION, SO.GNAV_SORDER, DF.GNAV_MCAT 
				FROM ".$p."GNAV_SCORE_HIERARCHY HA
				LEFT JOIN (SELECT GNAV_VALUE, GNAV_CATEGORY, GNAV_VALUE_TYPE, GNAV_DESCRIPTION, GNAV_MCAT, LANGUAGE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_SCAT') DF ON HA.GNAV_SCAT=DF.GNAV_VALUE
				LEFT JOIN (SELECT GNAV_DATA_TYPE, GNAV_VALUE, GNAV_SORDER, GNAV_SUSE FROM ".$p."GNAV_SCORE_SITE_ORDER WHERE GNAV_DATA_TYPE='GNAV_SCAT') SO ON HA.GNAV_SCAT=SO.GNAV_VALUE
				WHERE SO.GNAV_SUSE=1;";
		global $wpdb;
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getMetaDefs(){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$sql ="SELECT GNAV_VALUE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_MCAT' AND LANGUAGE='@EN';";
		$res = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $res;
	}
	private function getGNAV_GEO_JSON(){
		$myPath = plugin_dir_path( __FILE__ );
		$myPluginPath = substr($myPath, 0,(-1*strlen('includes/')));
		$docPath = $myPluginPath.'assets/json/' ;
		$docName = "countries.geojson";
		if(file_exists($docPath.$docName)){
			$resp = file_get_contents($docPath.$docName);
			return $resp;
		}
		else{
			error_log("GEOJSON file does not exist at" . $docPath.$docName);
			echo(header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found", true, 404));
			die();
		}
	}
	private function getSurveysBySelection(){
		global $wpdb;
		$p=$this->GNAV_PREFIX;	
		$mySelString = $_POST["GNAV_SELECT_SELECTION"];
		$mySelection= json_decode(stripslashes($mySelString));
		$SCAT_array = [];
		$SCAT_IX_array = [];
		// verify data
		if(!is_array($mySelection)){ return "data not an array";}
		$sql="SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY = 'GNAV_SCAT';";
		$allSCAT = $wpdb->get_col($sql);
		$sql = $wpdb->prepare("SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY = %s", 'GNAV_DCAT');
		$allDCAT = $wpdb->get_col($sql);
		$sql = "SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='YNQuestion';";
		$allYNQ = $wpdb->get_col($sql);
		$sql = "SELECT * FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_VALUE_TYPE';";
		$allValType = $wpdb->get_col($sql);
		foreach($mySelection as $sE){
			if(!is_array($sE) || count($sE)!=5){ return "selection data not array of 4";}
			if($sE[0]!="" && !in_array($sE[0],$allSCAT)){ return "illegal scoreCategory: ".$sE[0];};
			if($sE[1]!="" && !in_array($sE[1],$allDCAT)){ return "illegal dataCategory: ".$sE[1];};
			if($sE[2]!="" && !in_array($sE[2],$allYNQ)){ return "illegal YNQuestion: ".$sE[2];};
			if($sE[4]!="" && !in_array($sE[4],$allValType)){ return "illegal Value Type".$sE[4];}
			if($sE[3]!="" && $sE[1]!="" && !$this->verifySVal($sE[3], $sE[1])){ return "illegal scoreValue ".$sE[3] . ": " . $sE[1];}
		}
		// get all the things from the same scoreCat
		foreach($mySelection as $sE){
			if($sE[0]!=""){
				if(!in_array($sE[0],$SCAT_array)){
					$SCAT_array[]=$sE[0];
				}
			}
		}
		$allSV=[];
		foreach($SCAT_array as $scat){
			$SVList = [];
			foreach($mySelection as $sE){
				if($sE[0]==$scat){
					$SVS= $this->getMySelection($sE);
					foreach($SVS as $SV){
						if(!in_array($SV,$SVList)){
							$SVList[]=$SV;
						}
					}
				}
			}
			$allSV[]=$SVList;
		}
		$res=[];
		$compArray=$allSV[0];
		foreach($allSV as $sv){
			$res=array_intersect($compArray,$sv);
			$compArray=$res;
		}
		if(count($res)>0){
			$res=array_values($res);
		}
		return $res;
	}
	/***********************************/
	/************GNAV_ADMIN*************/
	/***********************************/
	private function getAllSurveys(){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$sql= "SELECT SV.SID, SV.SURVEY_STATUS, SV.create_user as SV_CREATE_USER, VS.SVERSION, VS.create_user as VS_CREATE_USER, VS.version_status, MV.maxVersion, SVN.GNAV_VALUE as surveyName FROM ".$p."GNAV_SURVEYS SV
				LEFT JOIN ".$p."GNAV_SVERSIONS VS ON SV.SID=VS.SID
				LEFT JOIN (SELECT SID, max(SVERSION) as maxVersion FROM ".$p."GNAV_SVERSIONS GROUP BY SID) MV ON SV.SID = MV.SID
				LEFT JOIN (SELECT SID, SVERSION, GNAV_VALUE FROM ".$p."GNAV_SURVEY_DATA WHERE GNAV_MCAT='surveyName') SVN ON SV.SID=SVN.SID AND MV.maxVersion=SVN.SVERSION
				ORDER BY SVN.GNAV_VALUE, VS.SVERSION;";
		global $wpdb;
		$res = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $res;
	}
	private function getAllDefs(){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql="SELECT DF.GNAV_VALUE, DF.GNAV_CATEGORY, DF.GNAV_VALUE_TYPE, DF.GNAV_DESCRIPTION, DF.GNAV_MCAT, SO.GNAV_SORDER FROM 
			(SELECT GNAV_VALUE, GNAV_CATEGORY, GNAV_VALUE_TYPE, GNAV_DESCRIPTION, GNAV_MCAT FROM ".$p."GNAV_DEFS WHERE LANGUAGE='@EN') DF
			LEFT JOIN (SELECT GNAV_DATA_TYPE, GNAV_VALUE, GNAV_SORDER, GNAV_SUSE FROM ".$p."GNAV_SCORE_SITE_ORDER) SO
			ON DF.GNAV_VALUE=SO.GNAV_VALUE AND DF.GNAV_CATEGORY=SO.GNAV_DATA_TYPE ;";
		$res=$wpdb->get_results($sql, OBJECT);
		return $res;
	}
	private function createSVWhere($inArray){
		if(!is_array($inArray)){return('');}
		$s_sqla = "SELECT SD.SID, SD.SVERSION FROM ".$this->GNAV_PREFIX."GNAV_SURVEY_DATA SD WHERE " ;
		$z=0;	
		$GNAV_SCAT = $inArray[0];
		if(!$this->verifySCat($GNAV_SCAT)){return FALSE;}
		$s_sqla.=  " (GNAV_SCAT = '" . $GNAV_SCAT . "' AND (" ;
		$VARRAY = $inArray[1];
		$x=0;
		foreach($VARRAY as &$V){
			$s_sqlb= '';
			if($x>0){ $s_sqlb.= ' OR ';}
			$dCat = $V[0]; 
			$sVal = $V[1];
			if(!$this->SValExists($sVal)){return FALSE;}
			if(strlen($dCat)>0){ 
				if(!$this->verifyDCat($dCat)){return FALSE;}
				$s_sqlb .= " GNAV_DCAT = '" . $dCat . "' AND GNAV_VALUE = '" . $sVal . "'" ;
			}
			else{
				$s_sqlb .= " GNAV_VALUE = '" . $sVal. "'" ;
			}
			$s_sqla.=$s_sqlb;
			$x+=1;
		}
		$s_sqla.= " )) ";
		return $s_sqla;
	}
	private function getGNAV_AllSurveyScores(){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$mySID = $this->cleanNode($_POST["GNAV_admin_allSurveyValues"]);
		$myVersion = $this->cleanVersion($_POST["GNAV_admin_sVersion"]);
		if(false==$mySID || false==$myVersion){
			return 0;
		}
		$sql = "SELECT DT.tid, DT.SID, DT.SVERSION, DT.GNAV_VALUE, 
				ifnull(VDEF.GNAV_DESCRIPTION, DT.GNAV_VALUE) as GNAV_VALUE_DESC,
				DTLT.GNAV_VALUE as GNAV_VALUE_LT,
				DT.GNAV_VALUE_TYPE, DT.GNAV_SCAT, DT.GNAV_DCAT, DT.GNAV_YNQUESTION, 
				YNDEF.GNAV_DESCRIPTION as GNAV_YNQUESTION_DESC, 
				DT.GNAV_MCAT, DT.GNAV_LANGUAGE, DT.GNAV_REMARKS 
				FROM ".$p."GNAV_SURVEY_DATA DT
				LEFT JOIN (SELECT GNAV_VALUE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='YNQuestion' and LANGUAGE='@EN') YNDEF ON DT.GNAV_YNQUESTION=YNDEF.GNAV_VALUE
				LEFT JOIN (SELECT GNAV_VALUE_ID, GNAV_VALUE FROM ".$p."GNAV_SURVEY_DATA_LT) DTLT ON DT.GNAV_VALUE=DTLT.GNAV_VALUE_ID
				LEFT JOIN (SELECT GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_VALUE' AND LANGUAGE='@EN') VDEF ON DT.GNAV_VALUE=VDEF.GNAV_VALUE AND DT.GNAV_DCAT=VDEF.GNAV_VALUE_TYPE
				WHERE SID='".$mySID."' AND SVERSION=".$myVersion."; ";
		global $wpdb;
		$prep = $wpdb->get_results($wpdb->prepare($sql, OBJECT));
		return $prep;
	}
	private function getGNAV_SurveyScores(){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$mySID = $_POST["GNAV_SELECT_SurveyScores"];
		$myVersion = $_POST["GNAV_SELECT_SVERSION"];
		if(!true==$this->verifyVersion($mySID,$myVersion)){return false;}
		$sql = "SELECT a.SCat, a.DCat, a.SVal, a.SVAL_TYPE 
			FROM ".$p."GNAV_GSCORE a WHERE SID = '" . $mySID. "' 
			UNION ALL SELECT GNAV_VALUE as SCat, '' as dCat, b.MetaVal as sVal, GNAV_DESCRIPTION as SVAL_TYPE 
			FROM ".$p."GNAV_DEFS D 
			LEFT JOIN GNAV_META b 
			ON D.GNAV_DESCRIPTION = b.MetaCat WHERE GNAV_VALUE_SUBTYPE = 'MetaCategory' AND b.SID = '" . $mySID. "' ORDER BY SCat, DCat, SVal;";	
		$prep = $wpdb->get_results($wpdb->prepare($sql, OBJECT));
		return $prep;
	}
	// **** user verification ***
	private function get_current_user(){
		global $current_user;
		get_currentuserinfo();
		return $current_user;
	}
	public function getUserRights($USR){
		$UID = ( isset( $USR->ID ) ? (int) $USR->ID : 0 );
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$usr_sql = "SELECT UID, GNAV_ALLOW_ACCEPT_REJECT, GNAV_ALLOW_MOD_USERS FROM ".$p."GNAV_USERS WHERE UID = ". $UID.";";
		$usr_r = $wpdb->get_row($usr_sql, OBJECT);
		// defaults to no rights
		$gnav_allow_accept_reject=FALSE;
		$gnav_allow_mod_users=FALSE;
		$user_stat=['none'];
		if(null !== $usr_r){
			// user has additional rights from the GNAV_USERS table
			$gnav_allow_accept_reject=$usr_r->GNAV_ALLOW_ACCEPT_REJECT;
			$gnav_allow_mod_users=$usr_r->GNAV_ALLOW_MOD_USERS;
			$user_stat[]='custom';
		}
		if($UID!=0){
			$USR_roles = $USR->roles;
			$admin_roles = ['administrator'];
			$aInterSect = array_intersect($admin_roles, $USR_roles);
			if(count($aInterSect)>0){
				$gnav_allow_accept_reject = TRUE;
				$gnav_allow_mod_users = TRUE;
				$user_stat[]='administrator';
			}
			if(is_super_admin($UID)){
				$gnav_allow_accept_reject = TRUE;
				$gnav_allow_mod_users = TRUE;
				$user_stat[]='super admin';
			}
		}
		return (object)[
			"gnav_allow_accept_reject"=>$gnav_allow_accept_reject, 
			"gnav_allow_mod_users"=>$gnav_allow_mod_users,
			"user_stat" => $user_stat
			];
	}
	// **** get data ***
	private function getMySelection($sE){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$cnt = 0;
		$sql= "SELECT VS.SID, VS.SVERSION FROM 
				(SELECT SID, max(SVERSION) as SVERSION FROM ".$p."GNAV_SVERSIONS GROUP BY SID, SVERSION, version_status HAVING version_status='publish') VS
				LEFT JOIN (SELECT SID, SURVEY_STATUS, created_at, create_user, remarks FROM ".$p."GNAV_SURVEYS WHERE SURVEY_STATUS='publish') SV ON VS.SID = SV.SID
				LEFT JOIN ".$p."GNAV_SURVEY_DATA DT ON VS.SID=DT.SID AND VS.SVERSION=DT.SVERSION ";
		//$sql = "SELECT DISTINCT DT.SID FROM ".$p."GNAV_SURVEY_DATA DT LEFT JOIN ".$p."GNAV_SURVEYS SV ON DT.SID=SV.SID AND DT.SVERSION=SV.SVERSION WHERE SV.status='publish' ";
		if($sE[0]!=""){ 
			if($cnt>0){ $sql .= " AND ";}
			else{$sql .= " WHERE ";} 
			$sql .= (" GNAV_SCAT='" . $sE[0]."'");
			$cnt+=1;}
		if($sE[1]!=""){
			if($cnt>0){ $sql .= " AND ";}
			else{$sql .= " WHERE ";} 			
			$sql .= (" GNAV_DCAT='" . $sE[1]."'");
			$cnt+=1;}
		if($sE[2]!=""){ 
			if($cnt>0){ $sql .= " AND ";}
			else{$sql .= " WHERE ";} 
			$sql .= (" GNAV_YNQUESTION='" . $sE[2]."'");
			$cnt+=1;}
		if($sE[3]!=""){ 
			if($cnt>0){ $sql .= " AND ";}
			else{$sql .= " WHERE ";} 
			$sql .= (" GNAV_VALUE='" . $wpdb->_real_escape($sE[3])."'");
			$cnt+=1;}
		if($sE[4]!=""){ 
			if($cnt>0){ $sql .= " AND ";}
			else{$sql .= " WHERE ";} 
			$sql .= (" GNAV_VALUE_TYPE='" . $sE[4]."'");
			$cnt+=1;}
		$sql.=";";
		//error_log($sql);
		$wpdb->show_errors();
		$res = $wpdb->get_col($sql);
		$wpdb->hide_errors();
		//error_log("getMySelection:" . count($res));
		return $res;
	}
	private function getSurveyValues(){
		$mSid = $this->cleanNode($_POST["GNAV_admin_surveyValues"]);
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$sql ="SELECT A.SCat, A.DCat, A.SVal, A.SVAL_TYPE 
			FROM ".$p."GNAV_GSCORE A 
			LEFT JOIN ".$p."GNAV_DEFS B 
			ON A.SVal = B.GNAV_VALUE AND A.SVAL_TYPE = B.GNAV_VALUE_TYPE AND A.DCat = B.GNAV_VALUE_SUBTYPE WHERE A.SID = '".$mSid."' ORDER BY A.SCat, A.DCat,A.SVal ;";
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getMetaValues(){
		$mSid = $_POST["GNAV_SELECT_surveyMetaValues"];
		$mVersion = $_POST["GNAV_SURVEY_VERSION"];
		if(TRUE!==$this->verifyVersion($mSid,$mVersion)){return FALSE;}
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$sql="SELECT 
					MCAT.GNAV_VALUE as GNAV_MCAT, MCAT.GNAV_DESCRIPTION AS GNAV_MCAT_DESC, 
					DT.SID, DT.SVERSION, 
					if(DT.GNAV_VALUE_TYPE='long_text', LT.GNAV_VALUE, DT.GNAV_VALUE) as GNAV_VALUE,
					DT.GNAV_VALUE_TYPE,
					ifnull(VDEF.GNAV_DESCRIPTION, if(DT.GNAV_VALUE_TYPE='long_text', LT.GNAV_VALUE, DT.GNAV_VALUE)) as GNAV_DESCRIPTION
				FROM
				(SELECT GNAV_VALUE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_MCAT') MCAT
				LEFT JOIN
				(SELECT SID, SVERSION, GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_SCAT, GNAV_DCAT, GNAV_YNQUESTION, GNAV_MCAT, GNAV_LANGUAGE, GNAV_REMARKS FROM ".$p."GNAV_SURVEY_DATA) DT ON MCAT.GNAV_VALUE=DT.GNAV_MCAT
				LEFT JOIN
				(SELECT GNAV_VALUE_ID, GNAV_VALUE FROM ".$p."GNAV_SURVEY_DATA_LT) LT ON DT.GNAV_VALUE = LT.GNAV_VALUE_ID
				LEFT JOIN 
				(SELECT GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_VALUE' AND LANGUAGE = '@EN') VDEF ON DT.GNAV_VALUE=VDEF.GNAV_VALUE AND DT.GNAV_VALUE_TYPE= VDEF.GNAV_VALUE_TYPE
				WHERE DT.SID=%d AND DT.SVERSION=%f;";
		global $wpdb;
		$prep= $wpdb->prepare($sql,	array($mSid, $mVersion));
		$res = $wpdb->get_results($prep,OBJECT);
		return $res;
	}
	private function getScoreDefs(){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$sql = "SELECT GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_DESCRIPTION, GNAV_MCAT FROM ".$p."GNAV_DEFS 
				WHERE GNAV_CATEGORY='GNAV_VALUE' AND LANGUAGE='@EN' ORDER BY GNAV_VALUE_TYPE, GNAV_VALUE;";
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getScoreHierarchy(){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$sql = "SELECT A.SCORE_CATEGORY as SCat, A.SCORE_PARENT as SParent FROM ".$p."GNAV_SCORE_HIERARCHY A;";
		$res = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $res;
	}
	private function getDisplayOrder(){
		$p=$this->GNAV_PREFIX;
		$sql="SELECT GNAV_DATA_TYPE, GNAV_VALUE, GNAV_SORDER FROM ".$p."GNAV_SCORE_SITE_ORDER WHERE GNAV_SUSE=1 ORDER BY GNAV_DATA_TYPE, GNAV_VALUE, GNAV_SORDER;";
		global $wpdb;
		$res = $wpdb->get_results($sql,OBJECT);
		return $res;
	}
	private function getScoreCatDefs(){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql = "SELECT GNAV_VALUE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_VALUE_TYPE='GNAV_SCAT'";
		$res = $wpdb->get_results($sql, OBJECT);
		return $res;
	}
	private function getScoreCatSU(){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql = "SELECT SCORE_CATEGORY, GNAV_SORDER, GNAV_SUSE FROM ".$p."GNAV_SCORE_SITE_ORDER;";
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getAllOrganizations(){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql = "SELECT GNAV_VALUE as ORG, GNAV_DESCRIPTION as orgDesc FROM ".$p."GNAV_DEFS WHERE GNAV_VALUE_TYPE='Organization';";
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getAllCountries(){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql = "SELECT GNAV_VALUE as CISO3, GNAV_DESCRIPTION as CNAME FROM ".$p."GNAV_DEFS WHERE GNAV_VALUE_TYPE='country_ISO3';";
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getAllUsers(){
		$res = [];
		$UIDS = [];
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql = "SELECT UID FROM ".$p."GNAV_USERS;";
		$gnav_users = $wpdb->get_results($sql,OBJECT);
		$admins = get_users([ 'role__in' => [ 'Administrator']]);
		$sadmins = get_super_admins();
		foreach($gnav_users as $gnu){
			$UIDS[]=$gnu->UID;
		}
		foreach($admins as $admin){
			$aID = $admin->ID;
			if(in_array($aID,$UIDS) ==false){
				$UIDS[]=$aID;
			}
		}
		if($sadmins!==['admin']){
			foreach($sadmins as $admin){
				$aID = $admin->ID;
				if(in_array($aID,$UIDS) ==false){
					$UIDS[]=$aID;
				}
			}
		}
		foreach($UIDS as $gnu){
			$gnuser = $this->getUserByID($gnu);
			$res[] = $gnuser;
		}
		return $res;
	}
	private function getAllMetaCats(){
		$p=$this->GNAV_PREFIX;
		$sql="SELECT MC.GNAV_VALUE as GNAV_MCAT, MC.GNAV_DESCRIPTION, SO.GNAV_SORDER FROM 
			(SELECT GNAV_VALUE, GNAV_CATEGORY, GNAV_VALUE_TYPE, GNAV_DESCRIPTION, GNAV_MCAT, LANGUAGE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_MCAT') MC
			LEFT JOIN 
			(SELECT GNAV_DATA_TYPE, GNAV_VALUE, GNAV_SORDER, GNAV_SUSE FROM ".$p."GNAV_SCORE_SITE_ORDER WHERE GNAV_DATA_TYPE= 'GNAV_MCAT' AND GNAV_SUSE=1) SO ON MC.GNAV_VALUE=SO.GNAV_VALUE
			WHERE SO.GNAV_SUSE=1 ORDER BY SO.GNAV_SORDER;";
		global $wpdb;
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getAllMetaCats_old(){
		$p=$this->GNAV_PREFIX;
		$sql = "SELECT DISTINCT MG.GNAV_VALUE, MG.GNAV_DESCRIPTION, MC.GNAV_VALUE_TYPE FROM
					(SELECT GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_VALUE_TYPE='GNAV_MCAT') MG
				LEFT JOIN 
					(SELECT GNAV_MCAT, GNAV_VALUE_TYPE FROM ".$p."GNAV_SURVEY_DATA WHERE GNAV_MCAT is not null) MC
				ON MG.GNAV_VALUE = MC. GNAV_MCAT;";
		global $wpdb;
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getUserByString(){
		$searchStr = $_POST["GNAV_UADMIN_getSearchUser"];
		if(!$this->cleanString($searchStr)){return false;}
		$users = new WP_User_Query( array(
			'search'         => '*'.esc_attr( $searchStr ).'*',
			'search_columns' => array(
				'user_login',
				'user_nicename',
				'user_email',
				'user_url',
				'first_name',
				'last_name'
				),
		) );
		$users_found = $users->get_results();
		$res = [];
		foreach ($users_found as $usr){
			$uObj= new stdClass();
			$uObj->UID = $usr->ID;
			$uObj->first_name = $usr->first_name;
			$uObj->last_name = $usr->last_name;
			$uObj->user_email= $usr->user_email;
			if(isset($usr->user_nicename)){
				$uObj->user_nicename= $usr->user_nicename;
			}
			$res[]=$uObj;
		}
		return $res;
	}
	private function getUserByID($UID){
		$usr = $this->getUser($UID);
		if($usr){
			$usr_rights = $this->getUserRights($usr);
			$uObj = new stdClass();
			$uObj->UID = $usr->ID;
			$uObj->first_name = $usr->first_name;
			$uObj->last_name = $usr->last_name;
			$uObj->user_email= $usr->user_email;
			if(isset($uObj->display_name)){
				$usr->display_name = $usr->display_name;
			}
			foreach($usr_rights as $key => $val){
				$uObj->$key = $val;
			}
			return $uObj;
		}
		return false;
	}
	private function getUserByIDPOST(){
		$UID = $_POST["GNAV_UADMIN_getUserByID"];
		if($this->cleanNode($UID)!=$UID){return false;}
		return $this->getUserByID($UID);
	}
	private function getUser($id){
		return get_user_by('id', $id);
	}
	private function getSurveyUser_Status($SID){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$SSID = $this->cleanNode($SID);
		if($SSID!=$SID){return false;}
		 
		$sql ="SELECT status, create_user FROM ".$p."GNAV_SURVEYS WHERE SID = ".$SID.";";
		$prep = $wpdb->get_results($wpdb->prepare($sql,OBJECT));
		return $prep;
	}
	private function getSurveyVersionStatus($SID,$VERSION){
		if($this->verifyVersion($SID,$VERSION)){
			$p=$this->GNAV_PREFIX;
			global $wpdb;
			$sql=$wpdb->prepare("SELECT SV.SID, SV.SURVEY_STATUS, SV.created_at, SV.create_user, VS.SVERSION,  VS.version_status, VS.created_at, VS.last_edit_at, VS.create_user, VS.last_edit_user
					FROM ".$p."GNAV_SURVEYS SV
					LEFT JOIN (SELECT SID, SVERSION, version_status, created_at, last_edit_at, create_user, last_edit_user FROM ".$p."GNAV_SVERSIONS) VS ON SV.SID=VS.SID
					WHERE SV.SID=%d AND VS.SVERSION=%f ;", array($SID,$VERSION));
			//$sql = $wpdb->prepare("SELECT status, create_user FROM ".$this->GNAV_PREFIX."GNAV_SURVEYS WHERE SID = %d AND SVERSION = %d;", array($SID,$VERSION));
			$stat = $wpdb->get_results($sql);
			return $stat;
		}
		return false;
	}
	private function actionAllowed($UID, $SID, $version, $action){
		$res = false; // not allowed by default.
		// every user is allowed to upload data
		if($action = "data_upload" && $UID!=0){return true;}
		$usr = $this->getUser($UID);
		$user_rights = $this->getUserRights($usr);
		if($action=="user_change" && $user_rights->user_allowed_mod_users){
			return true;
		}
		// all other actions involve changes to existing data.
		// verify if the survey /version exists.
		//$surveyStatus = $this->getSuveyUser_Status($SID);
		$SVSTAT = $this->getSurveyVersionStatus($SID, $version);
		if(!$SVSTAT || count($SVSTAT)==0){
			return false;
		}
		switch ($action){
			case "add_survey":
				if($UID!=0){return true;}
				break;
			case "data_change":
				if(in_array ($surveyStatus.version_status,["new", "in_process"])){return true;}
				break;
			case "dataset_accept":
				if( $user_rights->gnav_allow_accept_reject && in_array($surveyStatus.version_status,["new", "in_process", "pending_approval"])){return true;}
				break;
			case "dataset_reject":
				if( $user_rights->gnav_allow_accept_reject && in_array($surveyStatus.version_status,["new", "in_process", "pending_approval","publish"])){return true;}
				break;
			case "hide_survey":
				if( $user_rights->gnav_allow_accept_reject ){return true;}
				break;
			case "publish_survey":
				if( $user_rights->gnav_allow_accept_reject ){return true;}
					break;
			default:
				return false;
		}
		return false; // super default;	
	}		
	// **** process changes ****
	private function processSingleChange(){
		// accepted data: [sid, version, [SCat, DCat, YNQuestion, SVal, sVal_type],[SCat, DCat, YNQuestion, SVal, sVal_type]]
		global $wpdb;
		$rec_data = json_decode(stripslashes($_POST["changeData"]));
		//a. verify array
		if(!is_array($rec_data)){ return "illegal data no array";}
		if(count($rec_data)!=4){ return "illegal data 3: ".(string)count($rec_data);}
		if(count($rec_data, COUNT_RECURSIVE)!=14){return "illegal data 14: ". (string)count($rec_data, COUNT_RECURSIVE); }
		if(count($rec_data[2])!=5){return "illegal data O4";}
		if(count($rec_data[3])!=5){return "illegal data N4";}
		//b. verify sid
		$SID = $rec_data[0];
		$VERSION = $rec_data[1];
		//b1. verify sid, version
		if(!$this->verifyVersion($SID,$VERSION)){return "illegal data, no match found for surveyID and version";}
		//b2. verify version_status
		$stat_allowed=["new","in_process"];
		$prep = $wpdb->prepare("SELECT version_status FROM GNAV_SVERSIONS WHERE SID = %d AND SVERSION = %f",array($SID, $VERSION)); 
		$vStat = $wpdb->get_var($prep);
		if(!in_array($vStat, $stat_allowed)){return "only datasets with the status new or in_process can be updated";}
		//c. verify scat
		$OSCat = $rec_data[2][0];
		$NSCat = $rec_data[3][0];
		if($OSCat!="-1" && !$this->verifySCat($OSCat)){return "illegal data OSCat unknown";}
		if($NSCat!="-1" && !$this->verifySCat($NSCat)){return "illegal data NSCat unknown";}
		if($OSCat!=="-1" && $NSCat!=="-1" && $OSCat!=$NSCat){return "illegal data SCat not equal";}
		//d. verify dcat
		$ODCat = $rec_data[2][1];
		$NDCat = $rec_data[3][1];
		if($ODCat!="-1" && !$this->verifyDCat($ODCat)){return "illegal data OSCat unknown";}
		if($NDCat!="-1" && !$this->verifyDCat($NDCat)){return "illegal data NSCat unknown";}
		if($ODCat!=="-1" && $NDCat!=="-1" && $ODCat!=$NDCat){return "illegal data SCat not equal";}
		//e. verify valtype
		$oValType = $rec_data[2][4];
		$nValType = $rec_data[3][4];
		if($oValType!="-1" && !$this->defExists('GNAV_VALUE_TYPE', $oValType)){return "illegal data oValType unknown";}
		if($nValType!="-1" && !$this->defExists('GNAV_VALUE_TYPE', $nValType)){return "illegal data nValType unknown";}
		//f. verify values
		$OSVal = $rec_data[2][3];
		$NSVal = $rec_data[3][3];
		if($OSVal!="-1" && $OSCat!="-1" && !$this->verifyGNAV_VALUE([$OSVal,$ODCat])){return "illegal data, OValue and oDatacat not a valid combination";}
		if($NSVal!="-1" && $OSCat!="-1" && !$this->verifyGNAV_VALUE([$NSVal,$NDCat])){return "illegal data, OValue and oDatacat not a valid combination";}
		// g. check if new value already exists in the database
		$sql = $wpdb->prepare("SELECT * FROM ".$this->GNAV_PREFIX."GNAV_SURVEY_DATA WHERE SID = %d AND SVERSION= %f AND GNAV_VALUE= %s AND GNAV_VALUE_TYPE= %s AND GNAV_SCAT=%s AND GNAV_DCAT=%s", array($SID, $VERSION, $NSVal, $nValType, $NSCat, $NDCat));
		$res = $wpdb->get_results($sql, OBJECT);
		if($wpdb->num_rows >0){	return ['error', 'new data already in the database'];}
		//return "congrats, passed the tests!";
		//* user verification *//
		$c_user = $this->get_current_user();
		$c_UserID = $c_user->ID;
		if(!$this->actionAllowed($c_UserID, $SID, $VERSION, "data_change")){
			return "illegal action, you don´t have the rights to perform this action";
		}
		//SID, SVERSION, GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_SCAT, GNAV_DCAT, GNAV_MCAT, GNAV_LANGUAGE, GNAV_REMARKS, GNAV_VALUE_SEQ, GNAV_VALUE_STATUS
		if($NSVal=="-1" && $nValType=="-1" && $NSCat=="-1" && $NDCat=="-1"){ //delete the value
			$data = array(
				'SID' => $SID,
				'SVERSION' => $VERSION,
				'GNAV_VALUE' => $OSVal,
				'GNAV_VALUE_TYPE' => $oValType,
				'GNAV_SCAT' => $OSCat,
				'GNAV_DCAT' => $ODCat
				);
			$af_rows = $this->removeDATA($data);
			if(FALSE==$af_rows || 0==$af_rows){return ["failed","remove ".$OSCat." : ".$OSVal];}
			if($af_rows>0){
				$this->update_version_status("in_process", $SID, $VERSION);
				$this->log_action("value_removed", "SID:".$SID." SVERSION:".$VERSION." GNAV_SCAT:". $OSCat. " GNAV_VALUE:".$OSVal);
				return ["success", "rows removed: " . $af_rows];
			}
		}
		elseif($OSVal=="-1" && $oValType=="-1" && $OSCat=="-1" && $ODCat=="-1" && $NSVal!="-1" && $nValType!="-1" && $NSCat!="-1" && $NDCat!="-1"){ //INSERT NEW VALUE
			$VALUE_INS_DATA=array(
				'SID' => $SID,
				'SVERSION' => $VERSION,
				'GNAV_VALUE' => $NSVal,
				'GNAV_VALUE_TYPE' => $nValType,
				'GNAV_SCAT'=> $NSCat,
				'GNAV_DCAT'=> $NDCat,
				'GNAV_LANGUAGE' => '@EN',
				'GNAV_REMARKS' => 'data added by '. $c_UserID);
			//if($NDCat=="YNQuestion" && $SVI[4]){$VALUE_INS_DATA['GNAV_YNQUESTION']=$SVI[4];}
			$af_rows=$this->insertDATA($VALUE_INS_DATA);
			if(FALSE == $af_rows){return "error while inserting data" . $wpdb->print_error();}
			if(0 === $af_rows){return "no rows affected" . $wpdb->print_error();}
			if($af_rows>0){
				$this->update_version_status("in_process", $SID, $VERSION);
			}
			return "rows inserted: " . $af_rows;
		}
		elseif($OSVal!="-1" && $oValType!="-1" && $OSCat!="-1" && $ODCat!="-1" && $NSVal!="-1" && $nValType!="-1" && $NSCat!="-1" && $NDCat!="-1"){ // UPDATE VALUE
			$oData=array(
				'SID' => $SID,
				'SVERSION' => $VERSION,
				'GNAV_VALUE' => $OSVal,
				'GNAV_VALUE_TYPE' => $oValType,
				'GNAV_SCAT' => $OSCat,
				'GNAV_DCAT' => $ODCat
				);
			$nData=array(
				'SID' => $SID,
				'SVERSION' => $VERSION,
				'GNAV_VALUE' => $NSVal,
				'GNAV_VALUE_TYPE' => $nValType,
				'GNAV_SCAT' => $NSCat,
				'GNAV_DCAT' => $NDCat
				);
			$af_rows=$this->changeDATA($oData,$nData);
			if(FALSE==$af_rows|| 0==$af_rows){return ["failed","error while processing change"];}
			else{return ["success","data changed"];}
		}
	}
	private function processSingleMetaChange(){
		// data like: [mySid, myVersion, [oMCat, oMVal, oMType],[nMCat,nMVal, nMType]];
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$rec_data = json_decode(stripslashes($_POST["changeData"]));
		//a. verify array
		if(!is_array($rec_data)){ return ["failed","illegal data no array"];}
		if(count($rec_data)!=4){ return ["failed","illegal data 4: ". count($rec_data)];}
		if(count($rec_data, COUNT_RECURSIVE)!=10){return "illegal data 10: ". count($rec_data, COUNT_RECURSIVE); }
		if(count($rec_data[2])!=3){return ["failed","illegal data O3"];}
		if(count($rec_data[3])!=3){return ["failed","illegal data N3"];}
		//b. verify sid
		$SID = $rec_data[0];
		$vfy_sid = $this->verifySID($SID);
		if(!$vfy_sid){return ["failed","illegal data, surveyID unknown"];}
		// c. verify version
		$VERSION = $rec_data[1];
		if(!$this->verifyVersion($SID, $VERSION)){return ["failed","illegal data, no match found for surveyID and version"];}
		//c2. verify version_status
		$stat_allowed=["new","in_process"];
		$prep = $wpdb->prepare("SELECT version_status FROM GNAV_SVERSIONS WHERE SID = %d AND SVERSION = %f",array($SID, $VERSION)); 
		$vStat = $wpdb->get_var($prep);
		if(!in_array($vStat, $stat_allowed)){return ["failed","only datasets with the status new or in_process can be updated"];}
		//d. verify metacat
		// ["713307767","0.1",["surveyName","new test survey","general_text"],["surveyName","new test survey ddd","general_text"]]
		$oMetaCat = $rec_data[2][0];
		$nMetaCat = $rec_data[3][0];
		if($oMetaCat!="-1" && !$this->defExists('GNAV_MCAT', $oMetaCat)){return ["failed","illegal data oMetaCat unknown"];}
		if($nMetaCat!="-1" && !$this->defExists('GNAV_MCAT', $nMetaCat)){return ["failed","illegal data nMetaCat unknown"];}
		if($oMetaCat==-1 && $nMetaCat==-1){return ["failed","illegal data, metaCats unknown"];}
		if($oMetaCat!=-1 && $nMetaCat!=-1 && $oMetaCat!=$nMetaCat){ return ["failed","illegal data, metaCats do not match:" . $oMetaCat . " <-> ".  $nMetaCat];}
		//e. verify oData
		$oMetaVal = $rec_data[2][1];
		$oMetaVal_type = $rec_data[2][2];
		if($oMetaCat!=="-1" && $oMetaVal!=="-1" && $oMetaVal_type!=="-1"){
			if($oMetaVal_type=='long_text'){
				$prep = $wpdb->prepare("SELECT 
					DT.SID, 
					DT.SVERSION, 
					DT.GNAV_VALUE as VIDX, 
					DT.GNAV_VALUE_TYPE, 
					DT.GNAV_MCAT, 
					LT.GNAV_VALUE as GNAV_VALUE_LT 
				FROM 
					(SELECT SID, SVERSION, GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_MCAT FROM ".$p."GNAV_SURVEY_DATA DT WHERE GNAV_VALUE_TYPE='long_text') DT
					LEFT JOIN ".$p."GNAV_SURVEY_DATA_LT LT ON DT.GNAV_VALUE = LT.GNAV_VALUE_ID
				WHERE SID = %d AND SVERSION = %f AND GNAV_MCAT=%s AND DT.GNAV_VALUE=%s AND DT.GNAV_VALUE_TYPE = %s",
						array($SID, $VERSION, $oMetaCat, $oMetaVal, $oMetaVal_type));
				$res = $wpdb->get_row($prep, OBJECT);
				if(null===$res || $wpdb->num_rows==0){
					return ["failed",'could not find old data LT'];
				}
			}
			else{
				$prep = $wpdb->prepare("SELECT SID, SVERSION, GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_MCAT FROM ".$p."GNAV_SURVEY_DATA 
					WHERE SID = %d AND SVERSION = %f AND GNAV_MCAT=%s AND GNAV_VALUE=%s AND GNAV_VALUE_TYPE = %s", 
					array($SID, $VERSION, $oMetaCat, $oMetaVal, $oMetaVal_type));
				$res = $wpdb->get_row($prep,OBJECT);
				if($wpdb->num_rows===0){
					return ['failed','could not find old data'];
				}
			}
		}
		$nMetaVal = $rec_data[3][1];
		$nMetaVal_type = $rec_data[3][2];
		// verify value types
		$res = $wpdb->get_col("SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY = 'GNAV_VALUE_TYPE';");
		$res[]="-1";
		if(FALSE==in_array($oMetaVal_type, $res)){return ['failed','unknown valuetype for original value'];}
		if(FALSE==in_array($nMetaVal_type, $res)){return ['failed','unknown valuetype for target value'];}
		// f. verify user rights
		$c_user = $this->get_current_user();
		$c_UserID = $c_user->ID;
		//$UID, $SID, $version, $action
		if(!$this->actionAllowed($c_UserID, $SID, $VERSION, "data_change")){
			return ['failed', "illegal action, you don´t have the rights to perform this action"];
		}
		$wpdb->show_errors(); 
		if  ($oMetaCat!=="-1" && $oMetaVal!=="-1" && $oMetaVal_type!=="-1" && $nMetaCat==="-1" && $nMetaVal==="-1" && $nMetaVal_type==="-1" ){ // remove
			$data=array(
				"SID" => $SID,
				"SVERSION" => $VERSION, 
				"GNAV_VALUE" => $oMetaVal, 
				"GNAV_VALUE_TYPE" => $oMetaVal_type, 
				"GNAV_MCAT" => $oMetaCat);
			$af_rows=$this->removeDATA($data);
			if($af_rows>0){
				$this->update_version_status("in_process", $SID, $VERSION);
				$this->log_action("valueRemoved", "SID:".$t_SID." SVERSION:".$VERSION." GNAV_VALUE:".$OSVal);
				return ['success','removed: '.$af_rows. 'rows'];
				}
			else{return ['failed', 'remove of '. $oMetaCat. ' : ' . $oMetaVal];}
		}
		elseif($oMetaCat!=="-1" && $oMetaVal!=="-1" && $oMetaVal_type!=="-1" && $nMetaCat!=="-1" && $nMetaVal!=="-1" && $nMetaVal_type!=="-1" ){ // change
			if($oMetaCat == $nMetaCat){
				$oData=array(
				'SID' => $SID,
				'SVERSION' => $VERSION,
				'GNAV_VALUE' => $oMetaVal,
				"GNAV_MCAT" => $oMetaCat,
				"GNAV_VALUE_TYPE" => $oMetaVal_type,
				"GNAV_VALUE"=> $oMetaVal
				);
				$nData=array(
					'SID' => $SID,
					'SVERSION' => $VERSION,
					'GNAV_VALUE' => $nMetaVal,
					'GNAV_VALUE_TYPE' => $nMetaVal_type,
					'GNAV_MCAT' => $nMetaCat, 
					'GNAV_LANGUAGE' => '@EN'
					);
				$SCAT = $wpdb->get_var($wpdb->prepare("SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_SCAT' AND GNAV_MCAT=%s", array($nMetaCat)));
				if(NULL!==$SCAT){$nData['GNAV_SCAT']=$SCAT;}
				$af_rows=$this->changeDATA($oData,$nData);
				if(FALSE!==$af_rows && $af_rows>0){
					$this->update_version_status("in_process", $SID, $VERSION);
					return ['success',$af_rows];
					}
				else{
					return ['failed', "updating long_text:".$nMetaVal];
				}
			}
		}
		elseif($oMetaCat==="-1" && $oMetaVal==="-1" && $oMetaVal_type==="-1" && $nMetaCat!=="-1" && $nMetaVal!=="-1" && $nMetaVal_type!=="-1" ){ // insert
			$META_INS_DATA=array(
					'SID' => $SID,
					'SVERSION' => $VERSION,
					'GNAV_VALUE' => $nMetaVal,
					'GNAV_VALUE_TYPE' => $nMetaVal_type,
					'GNAV_MCAT' => $nMetaCat, 
					'GNAV_LANGUAGE' => '@EN',
					'GNAV_REMARKS' => 'data updated by '. $c_UserID);
			$SCAT = $wpdb->get_var($wpdb->prepare("SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_SCAT' AND GNAV_MCAT=%s", array($nMetaCat)));
			if(NULL!==$SCAT){$META_INS_DATA['GNAV_SCAT']=$SCAT;}
			$af_rows=$this->insertDATA($META_INS_DATA);
			if(FALSE==$af_rows){return ["failed","inserting ".$nMetaVal];}
			if(0===$af_rows){return ["failed","inserting ".$nMetaVal];}
			if($af_rows>0){
				$this->update_version_status("in_process", $SID, $VERSION);
				$this->log_action("valueAdded", "SID:".$t_SID." SVERSION:".$VERSION." GNAV_VALUE:".$OSVal);
				return ["success","inserting ".$nMetaVal];
				}
			}
		else{ //havent got a clue what to make of the data
			return ['nothing',0];
		}
	}
	private function getUniqueLTHash($valString, $SID, $VERSION){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		for ($i = 0; $i <= 1024; $i++){
			$tString = $valString.(string)$SID.(string)$VERSION.(string)$i;
			$nIDX = hash('sha1', $tString);
			$cntHash = $wpdb->get_var($wpdb->prepare("SELECT COUNT(GNAV_VALUE_ID) FROM ".$p."GNAV_SURVEY_DATA_LT WHERE GNAV_VALUE_ID = %s GROUP BY GNAV_VALUE_ID", array($nIDX)));
			if(NULL ===$cntHash ||  $cntHash===0){
				return $nIDX ;
			}
		}
		return false;
	}
	private function createUniqueSID($valString){
		for ($i=0;$i<1024;$i++){
			$nSID = crc32($valString.(string)$i);
			if(FALSE ===$this->SIDExists($nSID)){
				return $nSID;
			}
		}
	return FALSE;
	}
	private function update_survey_status($status, $SID, $VERSION){
		$myUser = $this->get_current_user();
		$myUserID = $myUser->ID;
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		//a. verify status
		$sql = "SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_VALUE_TYPE = 'publish status'";
		$allStat=$wpdb->get_col($sql);
		if(!in_array($status,$allStat)){
			return "unknown status: ".$status.", cannot set it for the survey.";
		}
		// b. verify user rights
		$c_user = $this->get_current_user();
		$c_UserID = $c_user->ID;
		$action = 'none';
		if($status=='publish'){$action="surveyAccept";}
		if($status=='not_accepted'){$action="surveyReject";}
		if(!$this->actionAllowed($c_UserID, $SID, "data_change")){
			return "illegal action, you don´t have the rights to perform this action";
		}	
		$af_rows = $wpdb->update($this->GNAV_PREFIX."GNAV_SURVEYS", 
			array(
			'status' => $status, 
			'last_edit_at' => current_time('mysql', 1), 
			'last_edit_user' => $myUserID ), 
			array(
				'SID' => $SID,
				'SVERSION' =>$VERSION), 
			array('%s','%s','%s'), 
			array('%d', '%f'));
		if($af_rows){$this->log_action("update_survey_status", "SID:".$SID." status:".$status);}
		return $af_rows;
	}
	private function update_version_status($status, $SID, $VERSION){
		// **** unchecked function ***//
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$tbl=$p.'GNAV_SVERSIONS';
		$res=$wpdb->update($tbl,
			array('version_status'=>$status),
			array('SID'=>$SID, "SVERSION"=>$VERSION),
			array('%s'),array('%d','%f'));
		if($res){$this->log_action("update_version_status", "SID:".$SID." SVERSION:".$VERSION." status:".$status);}
		return $res;
	}
	private function publish_survey(){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$SID = $_POST["GNAV_admin_publish_survey"];
		$vfy_sid = $this->verifySID($SID); // verify the SID
		if(!$vfy_sid){error_log("verifySID failed:".$SID);return $vfy_sid;}
		$res=$wpdb->update($p."GNAV_SURVEYS",
			array('SURVEY_STATUS' => 'publish'),
			array('SID' => $SID),
			array('%s'),
			array('%d'));
		if(!$res){
			$wpdb_error=$wpdb->print_error();
			error_log($wpdb_error);
		}
		if($res){$this->log_action("update_survey_status", "SID:".$SID." statuspublish");}
		return $res;
	}
	private function hide_survey(){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$SID = $_POST["GNAV_admin_hide_survey"];
		$vfy_sid = $this->verifySID($SID); // verify the SID
		if(!$vfy_sid){error_log("verifySID failed".$SID);return $vfy_sid;}
		$res=$wpdb->update($p."GNAV_SURVEYS",
			array('SURVEY_STATUS' => 'hidden'),
			array('SID' => $SID),
			array('%s'),
			array('%d'));
		if(!$res){
			$wpdb_error=$wpdb->print_error();
			error_log($wpdb_error);
		}
		if($res){$this->log_action("update_survey_status", "SID:".$SID." statushidden");}
		return $res;
	}
	private function reject_survey(){
		$SID = $_POST["GNAV_admin_reject_survey"];
		$VERSION = $_POST["GNAV_DS_VERSION"];
		$vfy_sid = $this->verifySID($SID);
		if(!$vfy_sid){return $vfy_sid;}
		if(!$this->verifyVersion($SID,$VERSION)){ return FALSE;}
		else{
			$status = "not_accepted";
			return $this->update_survey_status($status, $SID, $VERSION);
		}			
	}
	private function accept_survey(){
		$SID = $_POST["GNAV_admin_accept_survey"];
		$VERSION = $_POST["GNAV_DS_VERSION"];
		$vfy_sid = $this->verifySID($SID);
		if(!$vfy_sid){return $vfy_sid;}
		if(!$this->verifyVersion($SID,$VERSION)){ return FALSE;}
		else{
			$status = "publish";
			return $this->update_survey_status($status, $SID, $VERSION);
		}			
	}
	private function reject_version(){
		if(FALSE==isset($_POST["GNAV_admin_reject_version"]) || FALSE ==isset($_POST["GNAV_DS_VERSION"])){return FALSE;}
		$mySID = $_POST["GNAV_admin_reject_version"];
		$myVersion = $_POST["GNAV_DS_VERSION"];
		if(!true==$this->verifyVersion($mySID,$myVersion)){return FALSE;}
		$this->rollback_insert($mySID, $myVersion);
		return 1;
	}
	private function change_survey_status(){
		global $wpdb;
		if(FALSE==isset($_POST["GNAV_admin_change_survey_status"]) || FALSE ==isset($_POST["GNAV_DS_VERSION"]) || FALSE ==isset($_POST["GNAV_NSTATUS"] )) {
			return FALSE;
		}
		$mySID = $_POST["GNAV_admin_change_survey_status"];
		$myVersion = $_POST["GNAV_DS_VERSION"];
		$nStatus = $_POST["GNAV_NSTATUS"];
		if(!true==$this->verifyVersion($mySID,$myVersion)){return FALSE;}
		$sql = "SELECT GNAV_VALUE FROM GNAV_DEFS WHERE GNAV_VALUE_TYPE= 'publish status'";
		$allStat = $wpdb->get_col($sql);
		if(!in_array($nStatus,$allStat)){ return FALSE;}
		$sql_current_stat = $wpdb->prepare("SELECT status FROM  ".$this->GNAV_PREFIX."GNAV_SURVEYS WHERE SID = %d AND SVERSION = %f", array((int)$mySID, (float)$myVersion));
		$cstat = $wpdb->get_var($sql_current_stat);
		$newStats=["new","in_process"];
		$pre_publish_stats=["new","in_process","pending_approval"];
		$publis_stats=["publish","not_accepted"];
		// everyone can freely do with pre-published surveyStatus
		if(in_array($cstat,$newStats) && in_array($nStatus,$pre_publish_stats)){ // everyone can freely do with pre-published surveyStatus
			$af_rows = $wpdb->update($this->GNAV_PREFIX.'.GNAV_SURVEYS', 
				array(
				'status' => $nStatus, 
				'last_edit_at' => current_time('mysql', 1), 
				'last_edit_user' => $myUserID ), 
				array(
					'SID' => $mySID,
					'SVERSION' =>$myVersion), 
				array('%s','%s','%s'), 
				array('%d', '%f'));
			return $af_rows;
		}
		// b. verify user rights
		$c_user = $this->get_current_user();
		$c_UserID = $c_user->ID;
		$user_rights = $this->getUserRights($usr);
		// users with accept/reject rights can change to accept/reject
		if( $user_rights->user_allowed_accept && in_array($cstat,$pre_publish_stats) && in_array($nStatus, $publis_stats)){
			$af_rows = $wpdb->update($this->GNAV_PREFIX.'.GNAV_SURVEYS', 
				array(
				'status' => $nStatus, 
				'last_edit_at' => current_time('mysql', 1), 
				'last_edit_user' => $myUserID ), 
				array(
					'SID' => $mySID,
					'SVERSION' =>$myVersion), 
				array('%s','%s','%s'), 
				array('%d', '%f'));
			return $af_rows;
		}
		// no other changes are logical or allowed
		return FALSE;
	}
	private function change_version_status(){
		if(FALSE==isset($_POST["GNAV_admin_change_version_status"])){return false;}
		if(FALSE==isset($_POST["GNAV_DS_VERSION"])){return false;}
		if(FALSE==isset($_POST["GNAV_NSTATUS"])){return false;}
		$inSID=$_POST["GNAV_admin_change_version_status"];
		$inVERSION = $_POST["GNAV_DS_VERSION"];
		$inSTATUS=$_POST["GNAV_NSTATUS"];
		if(!$this->verifySID($inSID)){return "surveyID unknown";}
		if(!$this->verifyVersion($inSID,$inVERSION)){ return "dataset version is unknown for this survey";}
		if(!$this->defExists('version_status', $inSTATUS)){ return "unknown version_status";}
		//verify old version_status
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$prep = $wpdb->prepare("SELECT version_status FROM ".$p."GNAV_SVERSIONS WHERE SID = %d AND SVERSION = %f",array($inSID, $inVERSION)); 
		$orig_vSTAT = $wpdb->get_var($prep);
		if(($orig_vSTAT="new" ||  $orig_vSTAT="in_process") && in_array($inSTATUS,["in_process","pending_approval","publish"])){
			return $this->update_version_status($inSTATUS, $inSID, $inVERSION);
		}
		if($orig_vSTAT="pending_approval" && $inSTATUS=="publish"){
			return $this->update_version_status($inSTATUS, $inSID, $inVERSION);
		}
		return FALSE;
	}
	private function verifySID($sData){
		//1. illegal characters;
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		if($sData!=$this->cleanNode($sData)){ return false;}
		// verify against db	
		$sql_sid = "SELECT SID FROM ".$p."GNAV_SURVEYS";
		$res=$wpdb->get_col($sql_sid);
		return (in_array($sData, $res));
	}
	private function verifyVersion($SID, $VERSION){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		if(!$this->cleanVersion($VERSION)){ return "illegal version, illegal character(s)";}
		if(!$this->cleanNode($SID)){ return "illegal SID, illegal character(s)";}
		//verify against db;
		$prep = $wpdb->prepare("SELECT SID, SVERSION FROM ".$p."GNAV_SVERSIONS WHERE SID = %d AND SVERSION = %f", array((int)$SID,(float)$VERSION));
		$res = $wpdb->get_results($prep, OBJECT);
		if($wpdb->num_rows==1){
			return true;
		}
		return false;
	}
	private function setUserRights(){
		$UR = json_decode(stripslashes($_POST["GNAV_UADMIN_setUserRights"]));
		$curUser = wp_get_current_user(); //$this->get_current_user();
		$curUserID = $curUser->ID; 
		if(!is_object($UR)){return "received invalid data, not a valid object";}
		if(!isset($UR->UID)){return "invalid data, UID not set";}
		if(!isset($UR->gnav_allow_accept_reject)){return "invalid data, user_allowed_accept not set";}
		if(!isset($UR->gnav_allow_mod_users)){return "invalid data, user_allowed_mod_users not set";}
		if($this->cleanNode($UR->UID)!=$UR->UID){return "invalid data, given ID is not a number";}
		$v_array = [0,1];
		if(false===in_array($UR->gnav_allow_accept_reject,$v_array)){return "user_allowed_accept not 1 or 0.";}
		if(false===in_array($UR->gnav_allow_mod_users,$v_array)){return "user_allowed_mod_users not 1 or 0.";}
		if(!$this->actionAllowed($curUserID, 0, 0, "user_change")){return [$curUserID, "sorry, you don't have permission to modify user rights"];}
		// verify if user already exists in the GNAV_USERS table
		//actionAllowed($UID, $SID, $version, $action)
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql = $wpdb->prepare("SELECT UID, GNAV_ALLOW_ACCEPT_REJECT, GNAV_ALLOW_MOD_USERS FROM ".$p."GNAV_USERS WHERE UID = %d;",$UR->UID);
		$existing_users = $wpdb->get_results($sql, OBJECT );
		//SELECT UID, GNAV_ALLOW_ACCEPT_REJECT, GNAV_ALLOW_MOD_USERS FROM wordpress.GNAV_USERS;
		if(null==$existing_users || count($existing_users)==0){
			$sqlInsert = $wpdb->insert($p.'GNAV_USERS', array(
				'UID'=>$UR->UID, 
				'GNAV_ALLOW_ACCEPT_REJECT' => $UR->gnav_allow_accept_reject, 
				'GNAV_ALLOW_MOD_USERS' => $UR->gnav_allow_mod_users,
				),
				array('%d','%d', '%d')
				);
			if(false===$sqlInsert){return "error while adding new user rights.";}
			else{
				$AAR = 0;
				if($UR->gnav_allow_accept_reject){$AAR=1;}
				$AMU=0;
				if($UR->gnav_allow_mod_users){$AMU=1;}
				$logdata=("user ".$UR->UID . " AAR" .$AAR . " AMU"+$AMU); 
				$this->log_action("set user rights", $logdata);
				return $sqlInsert;}
		}
		else{
			//$wpdb->update( $table, $data, $where, $format = null, $where_format = null ); 
			$sqlUpdate = $wpdb->update($p.'GNAV_USERS',array(
				'GNAV_ALLOW_ACCEPT_REJECT' => $UR->gnav_allow_accept_reject, 
				'GNAV_ALLOW_MOD_USERS' => $UR->gnav_allow_mod_users,
				),
				array( 'UID' => $UR->UID ), 
				array('%d','%d'),
				array('%d')
				);
			if(false === $sqlUpdate){return "error while updating the user rights.";}
			else{
				$AAR = 0;
				if($UR->gnav_allow_accept_reject){$AAR=1;}
				$AMU=0;
				if($UR->gnav_allow_mod_users){$AMU=1;}
				$logdata=("user ".$UR->UID . " AAR" .$AAR . " AMU".$AMU); 
				$this->log_action("set user rights", $logdata);
				return ['updated', $sqlUpdate];}
		}
		return false;
	}
	private function addSurveyDS($SID){
		// add a survey dataset
		$myUser = $this->get_current_user();
		$myUserID = $myUser->ID;
		if($myUserID ==0){return false;}
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql_sid="SELECT DISTINCT SID FROM ".$p."GNAV_SURVEYS";
		$res = $wpdb->get_col($sql_sid);
		if(!in_array($SID,$res)){
			error_log('addSurveyDS error: SID'. $SID.' does not exist ');
			return false;
		}
		$NVERSION=$this->addVersion($SID);
		if(FALSE===$NVERSION){
			error_log("addSurveyDS failed for SID=".$SID);
			return FALSE;
		}
		return $NVERSION;
	}
	private function addSurvey(){
		$insLog=[];
		$surveyName=esc_sql($_POST["GNAV_admin_add_survey"]);
		if(FALSE!==$this->getSIDbyName($surveyName)){
			$insLog[]=[time(), 'error: survey exists already in the database'];
			return $insLog;
		}
		$newSID=$this->createUniqueSID($surveyName);
		if(FALSE==$newSID){
			$insLog[]=[time(), 'error: could not create unique survey ID'];
			return $insLog;
		}
		$myUser = $this->get_current_user();
		$myUserID = $myUser->ID;
		if(0===$myUserID){
			$insLog[]=[time(), 'error: only users that are logged in are allowed to add a survey'];
			return $insLog;
		}
		$NS = $this->addSurvey_UC($newSID);
		if(FALSE===$NS){
			$insLog[]=[time(), "insertion of survey failed . ".$newSID];
			$this->rollback_insert($newSID, 0.1);
			return $insLog;
		}
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$insLog[]=[time(), "Survey inserted : success ".$newSID];
		$t_VERSION=$this->addSurveyDS($newSID);
		$metaCat= "surveyName";
		$SCAT = $wpdb->get_var($wpdb->prepare("SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY='GNAV_SCAT' AND GNAV_MCAT=%s", array($metaCat)));
		$META_INS_DATA=array(
				'SID' => $newSID,
				'SVERSION' => $t_VERSION,
				'GNAV_VALUE' => $surveyName,
				'GNAV_VALUE_TYPE' => "general_text",
				'GNAV_MCAT' => $metaCat, 
				'GNAV_LANGUAGE' => '@EN',
				'GNAV_REMARKS' => 'new survey created by '. $myUserID);
		if(NULL!==$SCAT){$META_INS_DATA['GNAV_SCAT']=$SCAT;}
		$af_rows=$this->insertDATA($META_INS_DATA);
		if(FALSE==$af_rows || 0==$af_rows){
					$insLog[]=[time(), 'Failed to insert survey: ' . $surveyName];
					$this->rollback_insert($newSID, $t_VERSION);
				}
		else{
			$insLog[]=[time(), 'succesfully added ' . $surveyName. ' to the database'];
		}
		return $insLog;
	}
	private function addSurveyDSVersion(){
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$SID = $_POST["GNAV_admin_AddVersion"];
		// verify user
		$myUser = $this->get_current_user();
		$myUserID = $myUser->ID;
		if($myUserID ==0){return "error, only users that are logged in are allowed to add data to the database";}
		// verify SID
		if(FALSE==$this->verifySID($SID)){return "illegal data, SID does not exist in the database";}
		$NVERSION = $this->addVersion($SID);
		if(FALSE===$NVERSION){
			return FALSE;
		}
		$res = $this->cloneDataTo($SID, $OVERSION, $NVERSION);
		if(FALSE===$res){
			$this->rollback_insert($SID, $NVERSION);
			return FALSE;
		}
		$this->log_action("dataset added", "SID".$SID." SVERSION".$NVERSION);
		return $NVERSION;
	}
	private function cloneDataTo($SID, $OVERSION, $TVERSION){
		//error_log("cloneDataTo: " .$SID ." " . $OVERSION . " to " . $TVERSION);
		if(!$this->verifyVersion($SID,$OVERSION)){ 
			error_log('error>cloneDataTo: OVERSION does not exist');
			return FALSE;} //old version does not exist
		$p=$this->GNAV_PREFIX;
		global $wpdb;
		$oDataSQL = $wpdb->prepare("SELECT SID, SVERSION, GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_SCAT, GNAV_DCAT, GNAV_YNQUESTION, GNAV_MCAT, GNAV_LANGUAGE, GNAV_REMARKS FROM ".$p."GNAV_SURVEY_DATA 
				WHERE GNAV_VALUE_TYPE<>'long_text' AND SID = %d AND SVERSION= %f;", 
			array($SID, $OVERSION));
		$oData = $wpdb->get_results($oDataSQL, OBJECT);
		foreach($oData as $ODT){
			$res=$wpdb->insert($p.'GNAV_SURVEY_DATA', array(
				'SID' => $ODT->SID,
				'SVERSION' => $TVERSION,
				'GNAV_VALUE' => $ODT->GNAV_VALUE,
				'GNAV_VALUE_TYPE' => $ODT->GNAV_VALUE_TYPE,
				'GNAV_SCAT' => $ODT->GNAV_SCAT,
				'GNAV_DCAT' => $ODT->GNAV_DCAT,
				'GNAV_MCAT' => $ODT->GNAV_MCAT,
				'GNAV_YNQUESTION' =>$ODT->GNAV_YNQUESTION,
				'GNAV_LANGUAGE' => $ODT->GNAV_LANGUAGE),
				array('%d', '%f', '%s', '%s', '%s', '%s', '%s', '%s'));
			if(FALSE==$res){
				$this->rollback_insert($SID, $TVERSION);
				return false;
			}
		}
		$oDataLTSQL = $wpdb->prepare(
			"SELECT DT.SID, DT.GNAV_VALUE, DT.GNAV_VALUE_TYPE, DT.GNAV_SCAT, DT.GNAV_DCAT, DT.GNAV_MCAT, DT.GNAV_YNQUESTION, DT.GNAV_LANGUAGE, LT.GNAV_VALUE as LT_VAL FROM
			(SELECT SID, SVERSION, GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_SCAT, GNAV_DCAT, GNAV_MCAT, GNAV_YNQUESTION, GNAV_LANGUAGE FROM ".$p."GNAV_SURVEY_DATA WHERE GNAV_VALUE_TYPE='long_text') DT
			LEFT JOIN ".$p."GNAV_SURVEY_DATA_LT LT ON DT.GNAV_VALUE = LT.GNAV_VALUE_ID
			WHERE GNAV_VALUE_TYPE='long_text' AND DT.SID=%d AND DT.SVERSION=%f;",
			array($SID,$OVERSION));
		$oDataLT = $wpdb->get_results($oDataLTSQL, OBJECT);
		//error_log('oDataLT: '. count($oDataLT));
		foreach($oDataLT as $ODT){
			$hashID = $this->getUniqueLTHash($ODT->LT_VAL, $SID, $TVERSION);
			$res=$wpdb->insert($p.'GNAV_SURVEY_DATA', array(
				'SID' => $ODT->SID,
				'SVERSION' => $TVERSION,
				'GNAV_VALUE' => $hashID,
				'GNAV_VALUE_TYPE' => $ODT->GNAV_VALUE_TYPE,
				'GNAV_SCAT' => $ODT->GNAV_SCAT,
				'GNAV_DCAT' => $ODT->GNAV_DCAT,
				'GNAV_MCAT' => $ODT->GNAV_MCAT,
				'GNAV_YNQUESTION' =>$ODT->GNAV_YNQUESTION,
				'GNAV_LANGUAGE' => $ODT->GNAV_LANGUAGE),
				array('%d', '%f', '%s', '%s', '%s', '%s', '%s', '%s'));
				if(FALSE==$res){
					$this->rollback_insert($SID, $TVERSION);
					return false;
				}
			$res=$wpdb->insert($p."GNAV_SURVEY_DATA_LT",array(
				"GNAV_VALUE_ID" => $hashID, 
				"GNAV_VALUE" => $ODT->LT_VAL),
				array('%s','%s'));
				if(FALSE==$res){
					$this->rollback_insert($SID, $TVERSION);
					return false;
				}
		}
		$this->log_action("Cloned data: ", "SID:".$ODT->SID." SVERSION:".$OVERSION." to SVERSION:".$TVERSION);
		return true;
	}
	private function rollback_insert($SID, $VERSION){
		// check survey data
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		// check all Long Text
		$sql = $wpdb->prepare("SELECT GNAV_VALUE FROM ".$p."GNAV_SURVEY_DATA WHERE GNAV_VALUE_TYPE= %s AND SID = %s AND SVERSION = %f",array("long_text",$SID, $VERSION)); 
		$LT = $wpdb->get_col($sql);
		if($LT && count($LT)>0){
			foreach($LT as $L){
				$sql = $wpdb->delete($p."GNAV_SURVEY_DATA_LT", array("GNAV_VALUE_ID" => $L),array('%s'));
			}
		}
		//remove all data
		$wpdb->delete($p."GNAV_SURVEY_DATA", array("SID" =>$SID, "SVERSION" =>$VERSION), array('%d','%f'));
		//remove version
		$wpdb->delete($p."GNAV_SVERSIONS", array("SID" =>$SID, "SVERSION" =>$VERSION), array('%d','%f'));
		//remove SID if there is not version left.
		$sql = $wpdb->prepare("SELECT SID FROM ".$p."GNAV_SVERSIONS WHERE SID=%d ", array($SID));
		$vs = $wpdb->get_col($sql);
		if($vs && count($vs)==0){
			$wpdb->delete($p."GNAV_SURVEYS", array("SID" =>$SID), array('%d'));
		}
		$this->log_action("data removal", "SID:".$SID." SVERSION:".$VERSION);
	}
	// **** process changes unchecked data ****/
	private function insertDATA($data){
		// data as named array
		/* e.g.
			$data = (
				"SID"=>123456545, 
				"SVERSION"=>0.1, 
				"GNAV_VALUE"=>N, 
				"GNAV_VALUE_TYPE"=>"Sex disaggregated", 
				"GNAV_SCAT"=>"kj345kxcksdk", 
				"GNAV_DCAT"=>"Sex disaggregated")
		*/
		/*
		 all fields in GNAV_DATA
			SID,
			SVERSION,
			GNAV_VALUE,
			GNAV_VALUE_TYPE,
			GNAV_SCAT,
			GNAV_DCAT,
			GNAV_YNQUESTION,
			GNAV_MCAT,
			GNAV_LANGUAGE,
			GNAV_REMARKS
		*/
		/* set missing fields to null (if null is allowed) */
		$nullable_fields= ["GNAV_SCAT", "GNAV_DCAT", "GNAV_YNQUESTION", "GNAV_MCAT", "GNAV_REMARKS"];
		foreach ($nullable_fields as $NF){
			if(!array_key_exists($NF, $data)){$data[$NF]=null;}
		}
		/* some checks after all */
		$mandatory_fields=["SID", "SVERSION", "GNAV_VALUE","GNAV_VALUE_TYPE"];
		foreach ($mandatory_fields as $MF){
			if(!array_key_exists($MF, $data) || !$data[$MF] || $data[$MF]== null){ return FALSE;}
		}
		if(null==$data["GNAV_SCAT"] && null == $data["GNAV_MCAT"]){ return FALSE;} // data has to have either GNAV_SCAT or GNAV_MCAT (or both)
		if(!array_key_exists("GNAV_LANGUAGE",$data) || !$data["GNAV_LANGUAGE"]){$data["GNAV_LANGUAGE"]="@EN";} // assumed english
		$rows = 0;
		global $wpdb;	
		$p=$this->GNAV_PREFIX;
		if($data['GNAV_VALUE_TYPE']=="long_text"){
			$hash_value=$this->getUniqueLTHash($data['SID'],$data['SVERSION'],$data['GNAV_VALUE']);
			if(!$hash_value){return FALSE;}
			$rows_LT = $wpdb->insert($p."GNAV_SURVEY_DATA_LT",
				array(
					"GNAV_VALUE_ID" => $hash_value , 
					"GNAV_VALUE" => $data['GNAV_VALUE']),
				array('%s','%s'));
			if(FALSE==$rows_LT || 0==$rows_LT){return FALSE;}
			$rows = $wpdb->insert($p."GNAV_SURVEY_DATA", array(
				"SID" => $data['SID'],
				"SVERSION" => $data['SVERSION'],
				"GNAV_VALUE"=> $hash_value,
				"GNAV_VALUE_TYPE"=> $data['GNAV_VALUE_TYPE'],
				"GNAV_SCAT"=> $data['GNAV_SCAT'],
				"GNAV_DCAT"=> $data['GNAV_DCAT'],
				"GNAV_YNQUESTION"=> $data['GNAV_YNQUESTION'],
				"GNAV_MCAT"=> $data['GNAV_MCAT'],
				"GNAV_LANGUAGE"=> $data['GNAV_LANGUAGE'],
				"GNAV_REMARKS"=> $data['GNAV_REMARKS']),
				array('%d', '%f', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'));
			if(FALSE==$rows || 0==$rows){
				// remove LT
				$rows_LT =$wpdb->delete($p."GNAV_SURVEY_DATA_LT",	array(
					"GNAV_VALUE_ID" => $hash_value), array('%s'));
				return FALSE;
			}
		}
		else{
			$rows = $wpdb->insert($p."GNAV_SURVEY_DATA", array(
				"SID" => $data['SID'],
				"SVERSION" => $data['SVERSION'],
				"GNAV_VALUE"=> $data['GNAV_VALUE'],
				"GNAV_VALUE_TYPE"=> $data['GNAV_VALUE_TYPE'],
				"GNAV_SCAT"=> $data['GNAV_SCAT'],
				"GNAV_DCAT"=> $data['GNAV_DCAT'],
				"GNAV_YNQUESTION"=> $data['GNAV_YNQUESTION'],
				"GNAV_MCAT"=> $data['GNAV_MCAT'],
				"GNAV_LANGUAGE"=> $data['GNAV_LANGUAGE'],
				"GNAV_REMARKS"=> $data['GNAV_REMARKS']),
				array('%d', '%f', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'));
			if(FALSE==$rows || 0==$rows){
				return FALSE;
			}
		}
		$this->log_action("valueAdded", "SID:".$data['SID']." SVERSION:".$data['SVERSION']." GNAV_VALUE:".$data['GNAV_VALUE']);
		$this->setLastUpdate($data['SID'],$data['SVERSION']);
		return $rows;
	}
	private function removeDATA($data){
		// data as named array
		/* e.g.
			$data = (
				"SID"=>123456545, 
				"SVERSION"=>0.1, 
				"GNAV_VALUE"=>N, 
				"GNAV_VALUE_TYPE"=>"Sex disaggregated", 
				"GNAV_SCAT"=>"kj345kxcksdk", 
				"GNAV_DCAT"=>"Sex disaggregated")
		*/
		/* some checks after all */
		$nullable_fields= ["GNAV_SCAT", "GNAV_DCAT", "GNAV_YNQUESTION", "GNAV_MCAT", "GNAV_REMARKS", "GNAV_LANGUAGE"];
		$mandatory_fields=["SID", "SVERSION", "GNAV_VALUE","GNAV_VALUE_TYPE"];
		$allFields= [["SID", '%d'], ["SVERSION",'%f'],["GNAV_VALUE",'%s'],[ "GNAV_VALUE_TYPE",'%s'],["GNAV_SCAT",'%s'],["GNAV_DCAT",'%s'],["GNAV_YNQUESTION",'%s'],["GNAV_MCAT",'%s']];
		foreach ($nullable_fields as $NF){
			if(!array_key_exists($NF, $data)){$data[$NF]=null;}
		}
		foreach ($mandatory_fields as $MF){
			if(!array_key_exists($MF, $data) || !$data[$MF] || $data[$MF]== null){ return FALSE;}
		}
		if(null==$data["GNAV_SCAT"] && null == $data["GNAV_MCAT"]){ return FALSE;} // data has to have either GNAV_SCAT or GNAV_MCAT (or both)
		if(null==$data["GNAV_LANGUAGE"]){$data["GNAV_LANGUAGE"]="@EN";} // assumed english
		global $wpdb;	
		$p=$this->GNAV_PREFIX;
		if($data['GNAV_VALUE_TYPE']=="long_text"){
			$af_rows = $wpdb->delete("GNAV_SURVEY_DATA_LT", array("GNAV_VALUE_ID" => $data['GNAV_VALUE']),array('%s'));
			if(NULL==$af_rows || 0==$af_rows){return FALSE;}
		}
		// build the arrays
		$val_array=[];
		$type_array=[];
		foreach($allFields as $F){
			if(null!==$data[$F[0]]){
				$val_array[$F[0]]=$data[$F[0]];
				$type_array[]=$F[1];
			}
		}
		$af_rows = $wpdb->delete($p."GNAV_SURVEY_DATA", $val_array,$type_array);
		if(NULL==$af_rows || 0==$af_rows){return FALSE;}
		$this->log_action("valueRemoved", "SID:".$data['SID']." SVERSION:".$data['SVERSION']." GNAV_VALUE:".$data['GNAV_VALUE']);
		$this->setLastUpdate($data['SID'],$data['SVERSION']);
		return TRUE;
	}
	private function changeDATA($odata, $ndata){
		// data as named array
		/* e.g.
			$data = (
				"SID"=>123456545, 
				"SVERSION"=>0.1, 
				"GNAV_VALUE"=>N, 
				"GNAV_VALUE_TYPE"=>"Sex disaggregated", 
				"GNAV_SCAT"=>"kj345kxcksdk", 
				"GNAV_DCAT"=>"Sex disaggregated")
		*/
		/*
		 all fields in GNAV_DATA
			SID,
			SVERSION,
			GNAV_VALUE,
			GNAV_VALUE_TYPE,
			GNAV_SCAT,
			GNAV_DCAT,
			GNAV_YNQUESTION,
			GNAV_MCAT,
			GNAV_LANGUAGE,
			GNAV_REMARKS
		*/
		$nullable_fields= ["GNAV_SCAT", "GNAV_DCAT", "GNAV_YNQUESTION", "GNAV_MCAT", "GNAV_REMARKS", "GNAV_LANGUAGE"];
		$mandatory_fields=["SID", "SVERSION", "GNAV_VALUE","GNAV_VALUE_TYPE"];
		$allFields= [["SID", '%d'], ["SVERSION",'%f'],["GNAV_VALUE",'%s'],[ "GNAV_VALUE_TYPE",'%s'],["GNAV_SCAT",'%s'],["GNAV_DCAT",'%s'],["GNAV_YNQUESTION",'%s'],["GNAV_MCAT",'%s']];
		foreach ($nullable_fields as $NF){
			if(!array_key_exists($NF, $odata)){$odata[$NF]=null;}
			if(!array_key_exists($NF, $ndata)){$ndata[$NF]=null;}
		}
		foreach ($mandatory_fields as $MF){
			if(!array_key_exists($MF, $odata) || !$odata[$MF] || $odata[$MF]== null){ return FALSE;}
			if(!array_key_exists($MF, $ndata) || !$ndata[$MF] || $ndata[$MF]== null){ return FALSE;}
		}
		if(null==$odata["GNAV_SCAT"] && null == $odata["GNAV_MCAT"]){ return FALSE;} // data has to have either GNAV_SCAT or GNAV_MCAT (or both)
		if(null==$ndata["GNAV_SCAT"] && null == $ndata["GNAV_MCAT"]){ return FALSE;} // data has to have either GNAV_SCAT or GNAV_MCAT (or both)
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$hash_value;
		if($ndata["GNAV_VALUE_TYPE"]=="long_text"){
			$hash_value=$this->getUniqueLTHash($data['SID'],$data['SVERSION'],$data['GNAV_VALUE']);
			if(!$hash_value){return FALSE;}
			$rows_LT = $wpdb->insert($p."GNAV_SURVEY_DATA_LT",
				array(
					"GNAV_VALUE_ID" => $hash_value , 
					"GNAV_VALUE" => $data['GNAV_VALUE']),
				array('%s','%s'));
			if(NULL==$rows_LT || 0==$rows_LT){return FALSE;}
			// remove the old text
			$af_rows = $wpdb->delete($p."GNAV_SURVEY_DATA_LT", array("GNAV_VALUE_ID" => $odata['GNAV_VALUE']),array('%s'));
			if(NULL==$af_rows || 0==$af_rows){
				$wpdb->delete($p."GNAV_SURVEY_DATA_LT", array("GNAV_VALUE_ID" => $hash_value),array('%s'));
				return FALSE;
			}
			$ndata['GNAV_VALUE']=$hash_value;
		}
		// build the arrays
		$set_array=[];
		$where_array=[];
		$type_array_set=[];
		$type_array_where=[];
		foreach($allFields as $F){
			if(null!==$odata[$F[0]]){
				$where_array[$F[0]]=$odata[$F[0]];
				$type_array_where[]=$F[1];
			}
			if(null!==$ndata[$F[0]] && $ndata[$F[0]]!=$odata[$F[0]]){
				$set_array[$F[0]]=$ndata[$F[0]];
				$type_array_set[]=$F[1];
			}
		}
		$af_rows = $wpdb->update($p."GNAV_SURVEY_DATA",$set_array,$where_array,$type_array_set,$type_array_where);
		if(NULL==$af_rows || 0==$af_rows){
				if($ndata["GNAV_VALUE_TYPE"]=="long_text"){$wpdb->delete($p."GNAV_SURVEY_DATA_LT", array("GNAV_VALUE_ID" => $hash_value),array('%s'));}
				return FALSE;
		}
		$this->log_action("valueChanged", "SID:".$odata['SID']." SVERSION:".$odata['SVERSION']." GNAV_VALUE:".$odata['GNAV_VALUE']. " -> ". $ndata['GNAV_VALUE']);
		$this->setLastUpdate($data['SID'],$data['SVERSION']);
		return $af_rows;
	}
	private function insertDEFINITION($data){
		$allFields=[["GNAV_VALUE",'%s'], ["GNAV_CATEGORY",'%s'], ["GNAV_VALUE_TYPE",'%s'], ["GNAV_DESCRIPTION",'%s'], ["GNAV_MCAT",'%s'], ["LANGUAGE",'%s']];
		$mandatory_fields=["GNAV_VALUE","GNAV_CATEGORY","GNAV_VALUE_TYPE","GNAV_DESCRIPTION"];
		if(!array_key_exists("GNAV_LANGUAGE",$data) || !$data["GNAV_LANGUAGE"]){$data["GNAV_LANGUAGE"]="@EN";}
		foreach ($mandatory_fields as $MF){
			if(!array_key_exists($MF, $data) || !$data[$MF] || $data[$MF]== null){ return FALSE;}
		}
		$ins_array=[];
		$type_array=[];
		foreach($allFields as $F){
			if(array_key_exists($F[0],$data)){
				$ins_array[$F[0]]=$data[$F[0]];
				$type_array[]=$F[1];
			}
		}
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$af_rows=$wpdb->insert($p."GNAV_DEFS",$ins_array,$type_array);
		if(NULL==$af_rows || 0==$af_rows){
				return FALSE;
		}
		$this->log_action("definitionAdded", $data["GNAV_VALUE"]." : ". $data["GNAV_DESCRIPTION"]);
		return $af_rows;
	}
	private function setLastUpdate($SID, $VERSION){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$myUser = $this->get_current_user();
		$myUserID = $myUser->ID;
		$af_rows = $wpdb->update($p.'GNAV_SVERSIONS',
			array(
				'last_edit_at' => current_time('mysql', false),
				'last_edit_user' => $myUserID),
			array(
				'SID' => $SID,
				'SVERSION' => $VERSION),
			array('%s', '%s'), array('%d', '%f'));
		return $af_rows;
	}
	private function addVersion($SID){
		// only check on user, SID should be verified already.
		$myUser = $this->get_current_user();
		$myUserID = $myUser->ID;
		if($myUserID ==0){return false;}
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$NVERSION = 0.1;
		$sql_versions = $wpdb->prepare("SELECT SID, max(SVERSION) as MVERSION FROM ".$p."GNAV_SVERSIONS GROUP BY SID HAVING SID=%d", array($SID));
		$res = $wpdb->get_row($sql_versions, OBJECT);
		if($wpdb->num_rows > 0){$NVERSION = $res->MVERSION+0.1;}
		$af_rows = $wpdb->insert($p.'GNAV_SVERSIONS', 
			array(
				'SID' => $SID	, 
				'SVERSION' =>	$NVERSION, 
				'version_status' =>	"new", 
				'created_at' =>	current_time('mysql', false),
				'create_user' => $myUserID
				),
			array('%d', '%f', '%s', '%s', '%d'));
		if(0===$af_rows || FALSE ===$af_rows){
			error_log("addVersion FAILED for SID=".$SID);
			return FALSE;
		}
		$this->log_action("dataset added", "SID:".$SID." SVERSION:".$NVERSION);
		return $NVERSION;
	}
	private function addSurvey_UC($SID){
		$myUser = $this->get_current_user();
		$myUserID = $myUser->ID;
		if(0===$myUserID){
			return FALSE;
		}
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$af_rows = $wpdb->insert($p.'GNAV_SURVEYS', 
			array(
				'SID'=>$SID, 
				'SURVEY_STATUS'=>"new",
				'created_at'=> current_time('mysql', 1), 
				'create_user'=> $myUserID,
				'remarks' =>"data-upload"), 
			array('%d','%s','%s','%s','%s'));
		if(FALSE ===$af_rows || 0 === $af_rows){
			return FALSE;
		}
		return $SID;
	}
	// ************* update definitions ********/
	// this is purely a temporary hack //
	private function updateDEFS(){
		$defs=[];
		$defITM=["Women's work, decisionmaking, and control of income", "Women's work, decisionmaking and control of income"];
		$defs[]=$defITM;
		$defITM=["Inputs: fertilizer, pesticide, herbicide, and/or seeds", "Inputs: fertilizer, pesticide, herbicide and/or seeds"];
		$defs[]=$defITM;
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		foreach($defs as $def){
			$af_rows = $wpdb->update($p."GNAV_DEFS", 
				array("GNAV_DESCRIPTION" => $def[1]),
				array("GNAV_DESCRIPTION" => $def[0]),
				array('%s'), array('%s'));
		}
	}
	//*** data upload ***//
	private function split_semi_colon($val){
		$res_array=[];
		$NVAL=explode(";",$val);
		foreach($NVAL as $N){
			if(!ctype_space(trim($N))){
				$res_array[]=$N;
			}
		}
		return $res_array;
	}
	private function dataUpload(){
		$insLog = [];
		$myUser = $this->get_current_user();
		$myUserID = $myUser->ID;
		if(0===$myUserID){
			$insLog[]=[time(), 'only users that are logged in are allowed to upload data'];
			return $insLog;
		}
		$y_array=['y','Y','yes','YES','Yes'];
		$n_array=['n','N','no','NO','No'];
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		if ($_FILES['GNAV_file']['error'] !== UPLOAD_ERR_OK) { 
			$insLog[]=[time(), 'error while receiving file'];
			$insLog[]=[time(), 'data'.$_FILES['GNAV_file']['error']];
			return $insLog;
		}
		$insLog[]=[time(), 'file received'];
		$finfo = new finfo(FILEINFO_MIME_TYPE);
		if (false === $ext = array_search(
			$finfo->file($_FILES['GNAV_file']['tmp_name']),
			array(
				'xls' => 'application/vnd.ms-excel',
				'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				),
				true
			)
		){
			$insLog[]=[time(), 'invalid filetype'];
			return $insLog;
		}
		// continue processing the file
		$f_name = sha1_file($_FILES['GNAV_file']['tmp_name']);
		$upload_dir = wp_upload_dir();
		$f_full_name = sprintf($upload_dir['basedir'].'/%s.%s', $f_name, $ext);
		error_log($f_full_name);
		//$f_full_name = sprintf('/var/www/html/uploads/%s.%s', $f_name, $ext);
		if(!move_uploaded_file( $_FILES['GNAV_file']['tmp_name'], $f_full_name)) {
				$insLog[]=[time(), 'unable to process the file'];
				return $insLog;
			}
		// continue processing the file
		$gbx_reader = new gnav_xlsx_reader();
		$insLog[]=[time(), 'succesfully uploaded the file'];
		$metaName = "METADATA";
		$scoreValueName="GENDERSCORE"; 
		if(FALSE==$gbx_reader->open($f_full_name)){
			$insLog[]=[time(), 'unable to open the excel file'];
			return $insLog;
		}
		$metaArray = [];
		$scoreValueArray = [];
		$SVArray = [];
		// processing meta items
		if(false===$gbx_reader->openSheet($metaName)){
			$insLog[]=[time(), 'Could not open sheet ' . $metaName];
			return $insLog;
			}
		else{
			$insLog[]=[time(), 'Open sheet ' . $metaName. ': succes'];
		}
		$rowCount = $gbx_reader->getRowCount();
		$surveyExistsInDB = $gbx_reader->getCell(1,1);
		$surveyTitle = $gbx_reader->getCell(5,1);
		$stCat = $gbx_reader->getCell(5,0);
		if($stCat!="surveyName" || $surveyTitle== ""){
			$insLog[]=[time(), 'error: Could not find a survey name: '. $surveyTitle];
			return $insLog;
		}
		/****  fill meta array ****/
		for ($i = 6; $i <= $rowCount; $i++){
			$mCat = $gbx_reader->getCell($i,0);
			$mVal = $gbx_reader->getCell($i,1);
			if($mVal){
				$metaArray[] = [(string)$mCat,(string)$mVal];
			}
		}
		$insLog[]=[time(), $metaName. ': read ' . count($metaArray). ' metaItems'];
		/****  fill score array ****/
		if(false===$gbx_reader->openSheet($scoreValueName)){
			$insLog[]=[time(), 'Could not open sheet ' . $scoreValueName];
			return $insLog;
			}
		else{
				$insLog[]=[time(), 'Open sheet ' . $scoreValueName. ': succes'];
			}
		$rowCount = $gbx_reader->getRowCount();
		$y_array=['y','Y','yes','YES','Yes'];
		$n_array=['n','N','no','NO','No'];
		for($i=2; $i<=$rowCount; $i++){
			$sCat = $gbx_reader->getCell($i,0);
			$sYN = $gbx_reader->getCell($i,1);
			$sCatName = $gbx_reader->getCell($i,2);
			$respVal = $gbx_reader->getCell($i,3);
			$qrVal = $gbx_reader->getCell($i,4);
			$sdVal = $gbx_reader->getCell($i,5);
			$ynVal = $gbx_reader->getCell($i,6);
			
			error_log("row " . $i . ": " . $sCat. "; " . $sYN . "; " . $respVal . "; " . $qrVal . "; " . $sdVal . "; " . $ynVal);
			
			
			if($respVal && !ctype_space($respVal)){
				$N = $this->split_semi_colon($respVal);
				error_log('read respval:'.$respVal);
				foreach($N as $V){
					$SVArray[]=[
						(string)$V, 
						(string)$sCat, 
						(string)$sCatName, 
						"Respondent", 
						null];
				}
			}
			if($qrVal && !ctype_space($qrVal)){
				error_log('read qrVal:'.$qrVal);
				$N = $this->split_semi_colon($qrVal);
				foreach($N as $V){
					$SVArray[] =  [(string)$V, (string)$sCat, (string)$sCatName, "Question/Response Type", null];
				}
			}
			if($sdVal && !ctype_space($sdVal)){
				error_log('read sdVal:'.$sdVal);
				$N = $this->split_semi_colon($sdVal);
				foreach($N as $V){
					if(in_array($V, $y_array)){$SVArray[]=  [(string)"Y", (string)$sCat, (string)$sCatName, "Sex disaggregated", null];}
					else if(in_array($V, $n_array)){$SVArray[]=  [(string)"N", (string)$sCat, (string)$sCatName, "Sex disaggregated", null];}
				}
			}
			if($ynVal && !ctype_space($ynVal)){
				error_log('read ynVal:'.$ynVal);
				$N = $this->split_semi_colon($ynVal);
				foreach($N as $V){
					if(in_array($V, $y_array)){$SVArray[]=  [(string)"Y", (string)$sCat, (string)$sCatName, "YNQuestion", (string)$sYN];}
					elseif(in_array($V, $n_array)){$SVArray[]=  [(string)"N", (string)$sCat, (string)$sCatName, "YNQuestion", (string)$sYN];}
				}
			}
		}
		
		// close the reader and remove the file
		$gbx_reader->close();
		unset($gbx_reader);
		unlink($f_full_name); // delete the file after processing
		
		$insLog[]=[time(), $scoreValueName. ': read ' . count($SVArray). ' scoreValueItems'];
		
		
		/* START DATA PROCESSING */
		//*****  get SID *****//
		$tSV_ITEM = $this -> getSIDbyName((string)$surveyTitle);
		$t_SID=0;
		$t_VERSION=0.0;
		if($tSV_ITEM){
			$t_SID=$tSV_ITEM->SID;
		}

		// 1. SID  
		$y_array=['y','Y','yes','YES','Yes'];
		$n_array=['n','N','no','NO','No'];
		if(in_array((string)$surveyExistsInDB, $y_array)){ // user wants to ADD a version to an existing survey.
			if($t_SID==0){ // no match found in the database
				$insLog[]=[time(), "Survey does not exist in the database, but set as existing survey. Please verify the name"];
				return $insLog;
			}
			else{ //match found
				$insLog[]=[time(), "Survey exist in the database, adding version"];
				$t_VERSION=$this->addSurveyDS($t_SID);
				if(FALSE===$t_VERSION){
					$this->rollback_insert($t_SID, $t_VERSION);
					$insLog[]=[time(), "failed to add dataset to existing survey. sorry"];
					return $insLog;
				}
			}
		}
		else if(in_array((string)$surveyExistsInDB, $n_array)){ //user wants to create a NEW survey in the database
			if(!$tSV_ITEM){ // survey does not exist in the database, - creating new one
				$t_SID = $this->createUniqueSID($surveyTitle);
				if(FALSE===$t_SID){
					$insLog[]=[time(), "could not create unique SID for survey.".$surveyTitle];
					return $insLog;
				}
				$t_VERSION=0.1;
				error_log('data-upload: Survey does not exists: create new; SID=' . $t_SID);
				$insLog[]=[time(), "Survey does not exists: create new: ".$t_SID];
				$res = $this->addSurvey_UC($t_SID);
				if($t_SID!==$res){
					$insLog[]=[time(), "failed to insert ".$surveyTitle. " with SID ".$t_SID];
					return $insLog;
				}
				
				$insLog[]=[time(), "Survey inserted : success ".$t_SID];
				$t_VERSION=$this->addSurveyDS($t_SID);
				if(FALSE==$t_VERSION){
					$insLog[]=[time(), "failed: adding dataset. ".$t_SID];
					$this->rollback_insert($t_SID, null);
					return $insLog;
				}
				$insLog[]=[time(), "Created new survey and dataset."];
				$metaArray[] = ["surveyName",(string)$surveyTitle];
			}
			else{
				$insLog[]=[time(), "could not verify whether the intention was to create a new survey or add a dataset to an existing one: ". $surveyExistsInDB];
				return $insLog;
			}
		}
		else{
			$insLog[]=[time(), "Could not identify the whether it is supposed to be an existing survey or not, please verify the excel sheet."];
			return $insLog;
		}
		//2. verify meta-categories
		$allMCats=$this->getArrayFromArray($metaArray,0);
		$insLog[]=[time(), 'Verifying MCATS: '. json_encode($allMCats)];
		if(!$this->defExists('GNAV_MCAT', $allMCats)){
			$insLog[]=[time(), 'Found an unknown metacategory, please verify.'];
			$insLog[]=[time(), $allMCats];
			$this->rollback_insert($t_SID, $t_VERSION);
			return $insLog;
		}
		//3. verify scoreValueArray  $SVArray[]=[(string)$respVal, (string)$sCat, (string)$sCatName, "Respondent", null];
		//3.1 GNAV_SCAT
		$inSCS = $this->getArrayFromArray($SVArray, 1);
		if(FALSE==$this->defExists("GNAV_SCAT", $inSCS)){
			$insLog[]=[time(), 'Found an unknown scoreCategory, please verify.'];
			$insLog[]=[time(), json_encode($inSCS)];
			$this->rollback_insert($t_SID, $t_VERSION);
			return $insLog;
		}
		//3.2 GNAV_VALUE
		$inSVS = $this->getArrayFromArray($SVArray, [0,3]);
		$resINSVS=[];
		foreach($inSVS as $inVS){
			$VS=explode(";",$inVS[0]);
			foreach($VS as $EVS){
				if(!ctype_space($EVS)){$resINSVS[]=[trim($EVS),$inVS[1]];}
			}
		}
		$inSVS=$resINSVS;
		unset($resINSVS);
		if(FALSE==$this->verifyGNAV_VALUE($inSVS)){
			$insLog[]=[time(), 'Found an unknown VALUE, please verify.'];
			$this->rollback_insert($t_SID, $t_VERSION);
			return $insLog;
		}
		//3.2.1 GNAV_VALUE -> get proper case;
		$sql_allV = "SELECT GNAV_VALUE, GNAV_VALUE_TYPE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY = 'GNAV_VALUE';";
		$allV = $wpdb->get_results($sql_allV, ARRAY_N);
		$inSVS_pc=[];
		foreach($SVArray as $inSC){
			$X = [$inSC[0],$inSC[3]];
			foreach($allV as $V){
				if(strtolower($X[0])==strtolower($V[0]) && strtolower($X[1])==strtolower($V[1])){
					$inSVS_pc[]=[$V[0], $inSC[1], $inSC[2], $V[1], $inSC[4]];
					break;
				}
			}
		}
		if(count($inSVS_pc)==count($SVArray)){
			$SVArray=$inSVS_pc;
			unset($inSVS_pc);
		}
		else{
			$insLog[]=[time(), 'Failed to set proper cases for all the scores.'];
			$this->rollback_insert($t_SID, $t_VERSION);
			return $insLog;
		}
		// 3.3 verify YN questions.
		// $SVArray[]=[(string)$respVal, (string)$sCat, (string)$sCatName, "Respondent", null];
		$allYN = [];
		foreach($SVArray as $SV){
			if($SV[4]){
				$allYN[]=$SV[4];
			}
		}			
		if(count($allYN)>0){
			if(FALSE==$this->defExists("YNQuestion", $allYN)){
				$insLog[]=[time(), 'Found an unknown YNQuestion, please verify.'];
				$this->rollback_insert($t_SID, $t_VERSION);
				return $insLog;
			}
		}
		$insLog[]=[time(), "verification complete"];
		error_log("dataupload verification complete");
		$this->log_action("data upload", "SID:".$t_SID." SVERSION:".$t_VERSION);
		// **** executing changes **** //
		$insLog[]=[time(), "start inserting data."];
		// insert the metaCats
		$mv_in_count= 0; 
		$defType = 'general_text';
		$sql_vTypes= "SELECT GNAV_VALUE, GNAV_CATEGORY, GNAV_VALUE_TYPE FROM ".$p."GNAV_VTYPES WHERE GNAV_USE=1;";
		$allVTypes= $wpdb->get_results($sql_vTypes, OBJECT);
		$DFT_array=[
			'dsDescriptionValue' => 'long_text', 
			'persistentUrl' => 'URL',
			'distributorURL' => 'URL',
			'country_ISO3' => 'country_ISO3',
			'Year' => 'Year',
			'Organization' => 'Organization'];
		$GNAV_VALUE_TYPE=$defType;
		$expl_mitems=["Year","country_ISO3","SurveyType","keyword","Organization", "Executing Agency","Coverage","Domain"];
		foreach($metaArray as $metaItem){
			//$metaArray[] = [(string)$mCat,(string)$mVal];
			// get the value type 
			foreach ($allVTypes as $AVT){
				if($AVT->GNAV_CATEGORY=="GNAV_MCAT" && strtolower($AVT->GNAV_VALUE)==strtolower($metaItem[0])){
					$GNAV_VALUE_TYPE=$AVT->GNAV_VALUE_TYPE;
					break;
				}
			}
			// explode the explodable meta-categories
			if(in_array($metaItem[0], $expl_mitems)){
				$META_VALUES= explode(";",$metaItem[1]);
				foreach($META_VALUES as &$M){
					$M=trim($M);
					if (ctype_space($M)){unset($M);}
				}
			}
			else{
				$META_VALUES=array($metaItem[1]);
			}
			// create the insert arrays
			foreach ($META_VALUES as $MV){
				$META_INS_DATA=array(
					'SID' => $t_SID,
					'SVERSION' => $t_VERSION,
					'GNAV_VALUE' => $MV,
					'GNAV_VALUE_TYPE' => $GNAV_VALUE_TYPE,
					'GNAV_MCAT' => $metaItem[0], 
					'GNAV_LANGUAGE' => '@EN',
					'GNAV_REMARKS' => 'data upload by '. $myUserID);
				$SCAT = $wpdb->get_var($wpdb->prepare("SELECT GNAV_VALUE FROM GNAV_DEFS WHERE ".$p."GNAV_CATEGORY='GNAV_SCAT' AND GNAV_MCAT=%s", array($metaItem[0])));
				if(NULL!==$SCAT){$META_INS_DATA['GNAV_SCAT']=$SCAT;}
				if($GNAV_VALUE_TYPE=="Organization"){
					$sql_orgs="SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_VALUE_TYPE='Organization'";
					$DBORGS =$wpdb->get_col($sql_orgs, OBJECT);
					$morg = explode(":", $MV);
					if(count($morg)==2){
						$orgL = trim($morg[1]);
						$orgS = trim($morg[0]);
						if(strlen($orgL)<$orgS){ // buh, wrong order
							$orgL = trim($morg[0]);
							$orgS = trim($morg[1]);
						}
						if(!in_array($orgS,$DBORGS)){
							$org_data=array(
								"GNAV_VALUE"=>$orgS, 
								"GNAV_CATEGORY"=> "GNAV_VALUE", 
								"GNAV_VALUE_TYPE"=>'Organization', 
								"GNAV_DESCRIPTION" =>$orgL, 
								"LANGUAGE" => '@EN'
							);
							$this->insertDEFINITION($org_data);
						}
						$META_INS_DATA['GNAV_VALUE']=$orgS;
					}
					elseif(count($morg)==1){
						if(!in_array($morg[0],$DBORGS)){
							$org_data=array(
								"GNAV_VALUE"=>$morg[0], 
								"GNAV_CATEGORY"=> "GNAV_VALUE", 
								"GNAV_VALUE_TYPE"=>'Organization', 
								"GNAV_DESCRIPTION" =>$morg[0], 
								"LANGUAGE" => '@EN'
							);
							$this->insertDEFINITION($org_data);
						}
					}
					else{
						$insLog[]=[time(),"Could not properly add organization, please verify ". $MV];
						$this->rollback_insert($t_SID, $t_VERSION);
						return $insLog;
					}
				}
				$af_rows=$this->insertDATA($META_INS_DATA);
				if(FALSE==$af_rows){
					$insLog[]=[time(), 'Failed to insert Metadata: ' . $metaItem[0]. "->" . $MV];
					$this->rollback_insert($t_SID, $t_VERSION);
					return $insLog;
				}
				else{
					$mv_in_count++;	
				} 
			}
		}
		$insLog[]=[time(),"Inserted ". $mv_in_count. " meta items"];
		// insert the score values
		$sv_in_count= 0;
		//$SVArray[]=  [(string)$qrVal, (string)$sCat, (string)$sCatName, "Sex disaggregated", $sYN];}
		foreach($SVArray as $SVI){
			$VALUE_INS_DATA=array(
				'SID' => $t_SID,
				'SVERSION' => $t_VERSION,
				'GNAV_VALUE' => $SVI[0],
				'GNAV_VALUE_TYPE' => $SVI[3],
				'GNAV_SCAT'=> $SVI[1],
				'GNAV_DCAT'=> $SVI[3],
				'GNAV_LANGUAGE' => '@EN',
				'GNAV_REMARKS' => 'data upload by '. $myUserID);
			if($SVI[3]=="YNQuestion" && $SVI[4]){$VALUE_INS_DATA['GNAV_YNQUESTION']=$SVI[4];}
			$af_rows=$this->insertDATA($VALUE_INS_DATA);
			if(FALSE==$af_rows){
				$insLog[]=[time(), 'Failed to insert score data: ' . $metaItem[0]. "->" . $MV];
				$this->rollback_insert($t_SID, $t_VERSION);
				return $insLog;
			}
			else{
				$sv_in_count++;	
			}
		}
		$insLog[]=[time(), "Inserted " . $sv_in_count . " scorevalue items"];
		$insLog[]=[time(), "Done"];
		return $insLog;
	}
	private function getSIDbyName($sName){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$res = $wpdb->get_results("SELECT DISTINCT SID, GNAV_VALUE FROM ".$p."GNAV_SURVEY_DATA WHERE GNAV_MCAT= 'surveyName'",OBJECT);
		$rObject = false;
		foreach($res as $r){
			if($r->GNAV_VALUE==$sName){
				$rObject=$r;
			}
		}
		return $rObject;
	}
	private function getMetaCats(){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$tres=$wpdb->get_results("SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS where GNAV_VALUE_TYPE = 'GNAV_MCAT' and LANGUAGE = '@EN';", OBJECT);
		$res = [];
		foreach($tres as $t){
			$res[]=$t->GNAV_VALUE;
		}
		return $res;
	}
	private function getAllYNQ(){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql = "SELECT GNAV_VALUE, GNAV_DESCRIPTION FROM ".$p."GNAV_DEFS WHERE GNAV_VALUE_TYPE='YNQuestion';";
		return $wpdb->get_results($sql, OBJECT);
	}
	// **** data verification functions ***
	private function verifySCat($SC){
		return $this->defExists('GNAV_SCAT',$SC);
	}
	private function verifyDCat($DC){
		return $this->defExists('GNAV_DCAT',$DC);
	}
	private function SValExists($SV){
		return $this->defExists('GNAV_SVAL',$SV); 
	}
	private function YNQExists($YNQ){
		return $this->defExists('YNQuestion',$YNQ); 
	}
	private function verifyValueType($vTYPE){
		return $this->defExists('GNAV_VALUE_TYPE',$vTYPE); 
	}
	private function defExists($CATEGORY, $VERIFY){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$prep = $wpdb->prepare("SELECT GNAV_VALUE FROM ".$p."GNAV_DEFS WHERE GNAV_CATEGORY = %s", array($CATEGORY));
		$VALS=$wpdb->get_col($prep);
		$res=TRUE; //being nice, giving benefit of the doubt
		if(is_array($VERIFY)){
			foreach ($VERIFY as $VFY){
				if(!in_array($VFY, $VALS)){
					error_log("category: " .$CATEGORY. " value: " . $VFY. " not found!");
					$res=FALSE;
					break;
				}
			}
		}
		else{
			if(!in_array($VERIFY, $VALS)){
				error_log("category: " .$CATEGORY. " value: " . $VERIFY. " not found!");
				$res=FALSE;
			}
			else{
				$res=TRUE;
			}
		}
		return $res;
	}
	private function SIDExists($SID){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql = "SELECT DISTINCT SID FROM ".$p."GNAV_SURVEYS";
		$res = $wpdb->get_col($sql);
		return in_array($SID,$res);
	}
	private function verifyGNAV_VALUE($VAL){
		// val consists of (array of) tuples: [GNAV_VALUE, GNAV_DCAT];
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$res=true;
		$prep=$wpdb->prepare("SELECT GNAV_VALUE, GNAV_VALUE_TYPE FROM ".$p."GNAV_DEFS DEF WHERE GNAV_CATEGORY= %s AND GNAV_VALUE_TYPE<>'none'", array("GNAV_VALUE")); 
		$REFERENCE=$wpdb->get_results($prep, ARRAY_N); 
		foreach ($REFERENCE as &$ref){
			$ref=array_map('strtolower', $ref); 
		}
		if(is_array($VAL) && is_array($VAL[0])){
			// array of tuples
			foreach ($VAL as &$V){
				$V=array_map('strtolower', $V); 
			}
		}
		else{$VAL=array_map('strtolower', $VAL);}
		if(is_array($VAL) && is_array($VAL[0])){
			foreach ($VAL as $V){
				if(!in_array($V, $REFERENCE)){
					error_log(json_encode($V). " not found");
					return FALSE;
				}
			}
		}
		else{
			error_log('evaluating: ' . json_encode($VAL));
			if(!in_array($VAL, $REFERENCE)){
				error_log(json_encode($VAL). " not found");
					return FALSE;
			}
		}
		return TRUE;
	}
	private function verifySVal($SVal, $SDCat){
		global $wpdb;
		$p=$this->GNAV_PREFIX;
		$sql="SELECT GNAV_VALUE, GNAV_VALUE_TYPE FROM ".$p."GNAV_DEFS DEF WHERE GNAV_CATEGORY='GNAV_VALUE' AND GNAV_VALUE_TYPE <>'';";
		$res = $wpdb->get_results($sql, OBJECT);
		$fres = FALSE;
		foreach ($res as $r){
			if($r->GNAV_VALUE==$SVal && $r->GNAV_VALUE_TYPE==$SDCat){
				$fres=TRUE;
				break;
			}
		}
		return $fres;
	}
	private function log_action($action, $data){
		$curUser = wp_get_current_user(); //$this->get_current_user();
		$curUserID = $curUser->ID;
		$ins_data= $this->cleanStringAllowNumbers($data);
		$ins_action=$this->cleanStringAllowNumbers($action);
		if(!$ins_data || !$ins_action){ 
			if(!$ins_data){error_log("incorrect log data: data:" . $data);  return;}
			if(!$ins_action){error_log("incorrect log data: action:" . $action);  return;}
		}
		global $wpdb;
		$res = $wpdb->insert("GNAV_LOG",
			array(	"date_entry" => current_time('mysql', 1), 
					"GNAV_USER" => $curUserID, 
					"GNAV_ACTION" =>$ins_action, 
					"GNAV_DATA" =>$ins_data
					),
			array('%s', '%d', '%s','%s'));
		return $res;
	}
	private function getArrayFromArray($inArray, $arIndex){
		$res = [];
		$indexArray = [];
		$tArrayItem=[];
		foreach ($inArray as $IA){
			if( !is_array($arIndex)){
				if($IA[$arIndex]){
					$res[]=$IA[$arIndex];
				}
			}
			else{
				$tArrayItem=[];
				$cnt=count($arIndex);
				for($i=0; $i<$cnt; $i++){
					$idx=$arIndex[$i];
					if($IA[$idx]){$tArrayItem[$i]=$IA[$idx];}
					else{$tArrayItem[$i]=null;}
				}
				$res[]=$tArrayItem;
			}
		}
		return $res;
	}
	/************************************/
	/*******clean strings / values********/
	/************************************/
	private function cleanNode($nodeID){
		$result=preg_replace('/[^0-9]/','',$nodeID); // only numbers allowed in the string
		if($result==$nodeID){return $nodeID;}
		return false; //defaults to root
	}
	private function cleanString($instring){
		$str = preg_replace("/[^A-Za-z ]/","",$instring);
		if($str==$instring){return $instring;}
		return false;
	}
	private function cleanStringAllowNumbers($instring){
		$str = preg_replace("/[^A-Za-z0-9_:. ]/","",$instring);
		if($str==$instring){return $instring;}
		return false;
	}
	private function cleanVersion($vID){
		$result=preg_replace('/[^0-9.]/','',$vID);
		if($result==$vID){return $vID;}
		return false;
	}
	/************************************/
	/*******check existing tables********/
	/************************************/
	private function getAllTables(){
		global $wpdb;
		$sql = "SHOW TABLES LIKE '%'";
		$results = $wpdb->get_col($sql);
		return $results;
	}
	private function checkTables(){
		$p=$this->GNAV_PREFIX;
		$myTables=[];
		$res=[];
		$myTables[]='GNAV_DEFS';
		$myTables[]='GNAV_SURVEYS';
		$myTables[]='GNAV_SURVEY_DATA';
		$myTables[]='GNAV_SURVEY_DATA_LT';
		$myTables[]='GNAV_USERS';
		$myTables[]='GNAV_SCORE_SITE_ORDER';
		$myTables[]='GNAV_SCORE_HIERARCHY';
		foreach ($myTables as $tblName){
			if(!$this->tableExist($p.$tblName)){
				$res[]=[$tblName,"not found"];
				error_log($tblName. " not found!");
			}
		}
		return $res;
	}
	private function tableExist($tableName){
		global $wpdb;
		
		$sql = 'SHOW TABLES LIKE "'. $tableName.'";';
		$res= $wpdb->get_var($sql);
		if($res==$tableName){return TRUE;}
		return FALSE;
	}
}
?>