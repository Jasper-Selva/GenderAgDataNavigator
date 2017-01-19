<?php
//*** very basic excel reader for xlsx only
//*** author: Jasper van der Hout
//*** version: 0.1
//***
class gnav_xlsx_reader{
	private $name = "basic_xlsx_reader";
	protected $zip;
	protected $myExcelFile;
	protected $myXMLFile;
	protected $workBookXML;
	protected $cWorksheet;
	protected $cSharedStrings;
	private $sheetNames=[];
	/*** construct destruct ***/
	function __construct(){
		if(!$this->verifyExtensions()){
			return "not all necessary extensions are loaded";
			$this->__destruct();
		}
	}
	function __destruct() {
		$this->close();
    }
	/*** public functions ***/
	public function open($file){
		if(!is_file($file)){return "file does not exist";}
		if(!$this->verifyFile($file)){return "invalid filetype";}
		else{
			$this->myExcelFile = $file;
			if(!$this->getXML()){return "invalid file";}
			else{return TRUE;}
		}
	}
	public function openSheet($sheetName){
		unset($this->cWorksheet);
		foreach ($this->sheetNames as $sh){
			if($sh[1]==$sheetName){
				$sIndex = $sh[0];
				$xml_sheet_name = "sheet".$sIndex.".xml";
				$this->cWorksheet = $this->unpack($xml_sheet_name);
				if(!$this->cWorksheet){return FALSE;}
				else{return TRUE;}
			}
		}
		return FALSE;
	}
	public function getCell($g_row, $g_col){
		// very basic function to get a cell
		// only supports values and strings
		
		if(!$this->cWorksheet){return false;}
		$elem = new simpleXMLElement($this->cWorksheet);
		$rowCount = $elem->sheetData->row->count();
		$row_idx = $this->getRowIDX($g_row);
		$col_letter =$this->idxToLetter($g_col);
		$cell_Name=(string)$col_letter.(string)($g_row+1);
		
		
		if($g_row>=$rowCount || $g_row<0){return false;}
		$myRow = $elem->sheetData->row[(int)$row_idx];
		$myRowCellCount = $myRow->c->count();
		//error_log("row ". $g_row . " has ".$myRowCellCount." cells");
		for( $i=0; $i < $myRowCellCount; $i++){
			$cell = $myRow->c[$i];
			if($cell['r']==$cell_Name){
				if(!isset($cell['t'])){
					return $cell->v;
				}
				else{
					$cell_Type = $cell["t"];
					switch($cell_Type){
						case "s": 
							return $this->getSharedString($cell->v);
							break;
						case "inlineStr":
							return $cell->is->t;
							break;
						default: return FALSE;
					}
				}
			}
		}
		return FALSE;
	}
	public function close(){
		unset($this->zip);
		unset($this->myExcelFile);
		unset($this->myXMLFile);
		unset($this->workBookXML);
		unset($this->cWorksheet);
		unset($this->cSharedStrings);
		unset($this->sheetNames);
    }
	
	
	private function unpack($fileName){
		$TZIP = new ZipArchive;
		$res = $TZIP->open($this->myExcelFile);
		if($res===TRUE){
			$ws_index = $TZIP->locateName($fileName, ZipArchive::FL_NOCASE|ZipArchive::FL_NODIR );
			if(!$ws_index){
				//error_log("file does not contain ".$fileName); 
				return false;}
			//error_log('unpacking ' . $fileName. " succes");
			return $TZIP->getFromIndex($ws_index);
		}
		return false;
	}
	/*** private functions ***/
	private function getXML(){
		$TZIP = new ZipArchive;
		$res = $TZIP->open($this->myExcelFile);
		if($res===TRUE){
			$this->workBookXML = $this->unpack("workbook.xml");
			$this->cSharedStrings = $this->unpack("sharedStrings.xml");
			if(!$this->workBookXML || !$this->cSharedStrings){
				return false;
			}
			else{
				$this->getAllSheets();
			}
		}
	}
	private function getAllSheets(){
		/*
		<sheets>
			<sheet name="METADATA" sheetId="1" r:id="rId1"/>
			<sheet name="GENDERSCORE" sheetId="2" r:id="rId2"/>
		</sheets>
		*/
		$wSheetXML = new simpleXMLElement($this->workBookXML);
		if(!isset($wSheetXML->sheets)){
			//error_log('workBookXML does not contain sheet info');
			return false;
		}
		foreach($wSheetXML->sheets->sheet as $ws){
			//error_log("found sheet: " . $ws['name']);
			$this->sheetNames[] = [$ws['sheetId'],$ws['name']];
		}
	}		
	/*** verify stuff ***/
	private function verifyFile($file){
		$finfo = new finfo(FILEINFO_MIME_TYPE);
		$ext = $finfo->file($file);
		if(false === array_search($ext, array('xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'), true)){
			return "invalid filetype";
		}
		else{
			return true;
		}
	}
	private function getRowIDX($rowNumber){
		//excel starts with rownumber 1
		$myRN = (int)$rowNumber+1;
		
		$elem = new simpleXMLElement($this->cWorksheet);
		$rowCount = $elem->sheetData->row->count();
		for ($i = 0; $i <= $rowCount; $i++){
			$c_row = $elem->sheetData->row[$i];
			if(isset($c_row["r"])){
				if((int)$c_row["r"]==$myRN){
					return $i;
				}
			}
		}
		return false;
	}
	private function idxToLetter($idx){
		$alphabet = range('A', 'Z');
		if($idx<count($alphabet)){
			return ($alphabet[$idx]);
		}
		return false;
	}
	private function getSharedString($idx){
		$int_IDX = (int)$idx;
		$ssx =  new simpleXMLElement($this->cSharedStrings);
		if(!$ssx){
			//error_log('failed to open cSharedStrings as xml');
			return FALSE;
		}
		if(!isset($ssx->si)){
			//error_log('cSharedStrings does not contain si');
			return FALSE;
		}
		$ssCount = $ssx->si->count();
		if( $int_IDX >= $ssCount || $int_IDX < 0 ){ return FALSE;}
		$s_ss = $ssx->si[$int_IDX];
		//error_log($s_ss->asXML());
		if(!isset($s_ss->t)){
			//error_log('t not set in shared string');
			return FALSE;}
		return $s_ss->t;
	}
	private function verifyExtensions(){
		$needed = ['php_zip','php_xmlreader','php_simplexml'];
		foreach($needed as &$ext){
			if(FALSE===extension_loaded($ext)){
				return FALSE;
			}
		}
		return TRUE;
	}
}
?>