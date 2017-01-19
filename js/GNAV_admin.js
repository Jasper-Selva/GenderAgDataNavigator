//create_user
var GNAV_admin={
    allSurveys: 0,
    allCountries: 0,
    allOrganizations: 0,
    allStatus: 0,
    scoreDefs: 0, //GNAV_VALUE, GNAV_CATEGORY, GNAV_VALUE_TYPE, GNAV_DESCRIPTION, GNAV_MCAT
    scoreValDefs: 0,
    scoreCatDefs: 0,
    dataCatDefs: 0,
    scoreHArchy: 0,
    scoreCatO: 0,
    currentScores: 0,
    currentMeta: 0,
    allMeta: 0,
    selectedSurveys: 0,
    currentSurvey: 0,
    currentVersion:0,
    GNAV_DATA_URL: 0,
    GNAV_ROOT: 0,
    isDrawing: 0,
    popoverOptions: {
        animation : false,
        placement : 'right',
        trigger : 'hover focus',
        delay : {
            "show" : 500,
            "hide" : 100
        },
        html : true,
        container : 'body'
    },
    init: function() {
        GNAV_admin.GNAV_DATA_URL = GNAV_admin_local.GNAV_ajax_url;
        var t0 = performance.now();
        var iQ = d3_queue.queue(6)
            .defer(GNAV_admin.getAllSurveys)
            .defer(GNAV_admin.getScoreCatDefs)
            .defer(GNAV_admin.getAllDefs)
            .await(function (error, ALSV, SCDF, ALDEF){
                if (error) {
                    throw error;
                }
                GNAV_admin.allSurveys = ALSV;
                GNAV_admin.processDefs(ALDEF);
                GNAV_admin.scoreCatDefs = SCDF;
                GNAV_admin.GNAV_ROOT = GNAV_admin.getRootCatID();
                GNAV_admin.initDataUpload();
                GNAV_admin.initFilter();
                GNAV_admin.initSurveySelector();
                GNAV_admin.initNewSurvey();
                var t1 = performance.now();
                console.log('INIT: '+ (t1 - t0) + " milliseconds.");
            });
    },
    processDefs: function(data){
        var GNAV_CATEGORIES=["GNAV_DCAT","GNAV_MCAT", "GNAV_SCAT","GNAV_VALUE","GNAV_VALUE_TYPE","survey_status","version_status","YNQuestion"];
        var GNAV_VALUE_TYPES=["country_ISO2", "country_ISO3", "null", "Organization", "Question/Response Type", "Respondent", "Sex disaggregated", "YNQuestion"];
        var i, iM=data.length;
        GNAV_admin.allCountries=[];
        GNAV_admin.allOrganizations=[];
        GNAV_admin.allMeta=[];
        GNAV_admin.scoreCatDefs=[];
        GNAV_admin.scoreDefs=[];
        GNAV_admin.dataCatDefs=[];
        GNAV_admin.allStatus=[];
        for ( i = 0; i < iM; i += 1 ) {
            if(data[i].hasOwnProperty('GNAV_VALUE_TYPE') && data[i].GNAV_VALUE_TYPE=="country_ISO3"){GNAV_admin.allCountries.push(data[i]);}
            if(data[i].hasOwnProperty('GNAV_VALUE_TYPE') && data[i].GNAV_VALUE_TYPE=="Organization"){GNAV_admin.allOrganizations.push(data[i]);}
            if(data[i].hasOwnProperty('GNAV_CATEGORY') && data[i].GNAV_CATEGORY=="GNAV_MCAT"){GNAV_admin.allMeta.push(data[i]);}
            if(data[i].hasOwnProperty('GNAV_CATEGORY') && data[i].GNAV_CATEGORY=="GNAV_SCAT"){GNAV_admin.scoreCatDefs.push(data[i]);}
            if(data[i].hasOwnProperty('GNAV_CATEGORY') && data[i].GNAV_CATEGORY=="GNAV_VALUE"){GNAV_admin.scoreDefs.push(data[i]);}
            if(data[i].hasOwnProperty('GNAV_CATEGORY') && data[i].GNAV_CATEGORY=="GNAV_DCAT"){GNAV_admin.dataCatDefs.push(data[i]);}
            if(data[i].hasOwnProperty('GNAV_CATEGORY') && (data[i].GNAV_CATEGORY=="version_status" || data[i].GNAV_CATEGORY=="survey_status")){GNAV_admin.allStatus.push(data[i]);}
        }
        
        var vers_all= {GNAV_VALUE : "all", GNAV_CATEGORY: "version_status", GNAV_DESCRIPTION : "all versions"}; 
        var surv_all= {GNAV_VALUE : "all", GNAV_CATEGORY: "survey_status", GNAV_DESCRIPTION : "all versions"}; 
        GNAV_admin.allStatus.push(vers_all);
        GNAV_admin.allStatus.push(surv_all);

        GNAV_admin.allMeta.sort(GNAV_admin.sortBySORDER);
        GNAV_admin.scoreCatDefs.sort(GNAV_admin.sortBySORDER);
        GNAV_admin.scoreDefs.sort(GNAV_admin.sortBySORDER);
    },
    reloadPage: function(SID, SVERSION){
        GNAV_admin.resetData();
        var iQ = d3_queue.queue(1)
            .defer(GNAV_admin.getAllSurveys)
            .await(function (error, ALSV){
             if (error) {throw error;}
            GNAV_admin.allSurveys = ALSV; 
            if(SID && SVERSION){ GNAV_admin.initSurveySelector(SID, SVERSION);}
            else{GNAV_admin.initSurveySelector();}
            GNAV_admin.initFilter();
            
            });
    },
    setSelectedSurvey: function(SID){
        var sSelect=jQuery('select.GNAV_ADMIN_SURVEY_SELECTOR');
        var allOpt = jQuery(sSelect).children('option');
        var i, iM=allOpt.length;
        var sIndex=0;
        for ( i = 0; i < iM; i += 1 ) {
            if(jQuery(allOpt[i]).attr('sid')==SID){
                sIndex = i;
                jQuery(sSelect).prop('selectedIndex',sIndex);
                return;
            }
        }
        jQuery(sSelect).prop('selectedIndex',sIndex);
    },
    setSelectedSVersion: function(SVERSION){
        var sSelect =jQuery('.GNAV_ADMIN_SURVEY_VERSION_SEL');
        var allOpt = jQuery(sSelect).children('.GNAV_ADMIN_OPTION_VERSION');
        var i, iM=allOpt.length;
        var sIndex=0;
        for ( i = 0; i < iM; i += 1 ) {
            if(jQuery(allOpt[i]).attr('sversion')==SVERSION){
                sIndex = i;
                jQuery(sSelect).prop('selectedIndex',sIndex);
                return;
            }
        }
        jQuery(sSelect).prop('selectedIndex',sIndex);
    },
    initDataUpload: function(){
        jQuery('a.GNAV_ADMIN_DOWNLOAD').attr('href', GNAV_admin_local.dataTemplate);
        jQuery('#_wpnonce').attr('value', GNAV_admin_local.ajax_nonce);
        jQuery('#GNAV_ADMIN_DU_VALUE').attr('value','gnav_proc');
		jQuery('#GNAV_ADMIN_FORM_DATA_UPLOAD').off('submit');
        jQuery('#GNAV_ADMIN_FORM_DATA_UPLOAD').submit(function(){GNAV_admin.admin_upload_xl();});
    },
    
    initNewSurvey: function(){
        var submit_button=jQuery('#GNAV_ADMIN_ADD_BY_INPUT_submit');
        var survey_IP_text=jQuery('#GNAV_ADMIN_ADD_BY_INPUT');
        var hideAddSurvey=jQuery('.GNAV_ADMIN_ADD_HIDE');

        jQuery(survey_IP_text).off('bind');
        jQuery(submit_button).off('click');
        jQuery(hideAddSurvey).off('click');
        
        jQuery(submit_button).removeClass('hasChange');
        
        jQuery(survey_IP_text).bind('input', function(){
            if(jQuery(this).val() =="" || !jQuery(this).val()){jQuery('#GNAV_ADMIN_ADD_BY_INPUT_submit').removeClass('hasChange');}
            else{jQuery('#GNAV_ADMIN_ADD_BY_INPUT_submit').addClass('hasChange');}
        });
        jQuery(submit_button).click(function(){
            var survey_IP_text=jQuery('#GNAV_ADMIN_ADD_BY_INPUT');
            if(!jQuery(survey_IP_text).val() || jQuery(survey_IP_text).val() ==""){
                jQuery(this).removeClass('hasChange');
                return;
            }
            var newSurveyName=jQuery(survey_IP_text).val()
            jQuery('.overlay').addClass('hideContent');
            GNAV_MAIN.show_spinner();
            var d = d3_queue.queue()
                .defer(GNAV_admin.add_survey_by_text, newSurveyName)
                 .await(function (error,data){
                     if(error){
                         alert(error);
                     }
                     GNAV_admin.showUploadResult(data);
                     GNAV_admin.reloadPage();
                     GNAV_MAIN.remove_spinner();
                     jQuery('.overlay').removeClass('hideContent');
                 });
        });
        jQuery(hideAddSurvey).click(function(){
            var addByF = jQuery('#GNAV_ADMIN_ADD_BY_FILE');
            var addByI = jQuery('#GNAV_ADMIN_ADD_BY_ENTRY');
           
            if(jQuery(this).attr('show_add_sv')=='show'){
                jQuery(addByF).hide(300);
                jQuery(addByI).hide(300);
                jQuery(this).attr('show_add_sv','hidden');
            }
            else{
                jQuery(addByF).show(300);
                jQuery(addByI).show(300);
                jQuery(this).attr('show_add_sv','show');
            }
        });
                
                
                
            
    },
    resetData: function(){
        var surveySelector = jQuery("select.GNAV_ADMIN_SURVEY_SELECTOR");
        var versionSelector= jQuery("select.GNAV_ADMIN_SURVEY_VERSION_SEL");
        jQuery('button.GNAV_ADMIN_MANAGE_SURVEYSTATUS').removeClass('enabled');
        jQuery(surveySelector).empty();
        jQuery(versionSelector).empty();
        GNAV_admin.currentSurvey = -1;
        GNAV_admin.currentVersion= -1;
    },
    surveyCount: function(surveyStatus){
        var i, iM=GNAV_admin.allSurveys.length;
        var SID_LIST=[];
        var res=0;
        var surveyObject;
        for ( i = 0; i < iM; i += 1 ) {
            surveyObject=GNAV_admin.allSurveys[i];
            if(surveyStatus=="all"){
                if(SID_LIST.indexOf(surveyObject.SID)==-1){
                    SID_LIST.push(surveyObject.SID);
                    res+=1;
                }
            }
            else{
                if(surveyObject.hasOwnProperty('SURVEY_STATUS') && surveyObject.SURVEY_STATUS==surveyStatus){
                    if(SID_LIST.indexOf(surveyObject.SID)==-1){
                        SID_LIST.push(surveyObject.SID);
                        res+=1;
                    }
                }
            }
        }
        return res;
    },
    versionCount: function(){
        var i, iM=GNAV_admin.allSurveys.length;
        var res={};
        var surveyObject, version_status;
        for ( i = 0; i < iM; i += 1 ) {
            surveyObject=GNAV_admin.allSurveys[i];
            version_status=surveyObject.version_status;
            if(res.hasOwnProperty(version_status)){res[version_status]+=1;}
            else{res[version_status]=1;}
        }
        res['all']=iM;
        return res;
    },
    initSurveySelector: function(SID, SVERSION){
        // empty the selector
        var surveySelector = jQuery("select.GNAV_ADMIN_SURVEY_SELECTOR");
        var versionSelector= jQuery("select.GNAV_ADMIN_SURVEY_VERSION_SEL");
        jQuery(surveySelector).empty();
        jQuery(versionSelector).empty();
        
        GNAV_admin.currentSurvey = -1;
        GNAV_admin.currentVersion= -1;
        
        var gotoSurveyButton = jQuery("button.GNAV_ADMIN_SURVEY_SELECTOR_EXEC");
        if(SID && SVERSION){GNAV_admin.fillSurveyList(SID, SVERSION);}
        else{GNAV_admin.fillSurveyList();}
        
        jQuery(gotoSurveyButton).click(function(){
            var surveySel = document.querySelector("select.GNAV_ADMIN_SURVEY_SELECTOR");
            var versionSel = document.querySelector("select.GNAV_ADMIN_SURVEY_VERSION_SEL");
            var mySIndex = surveySel.options.selectedIndex;
            var myVIndex = versionSel.options.selectedIndex;
            var mySid, myVersion;
            if(mySIndex>-1){
                mySid = surveySel.options[mySIndex].value;
                myVersion = versionSel.options[myVIndex].value;
                jQuery('button.GNAV_ADMIN_MANAGE_SURVEYSTATUS').addClass('enabled');
                GNAV_admin.currentSurvey=mySid;
                GNAV_admin.selectSurvey(mySid,myVersion);
            }
        });
    },
    initFilter: function(){
        var surveyStatSelect= jQuery(".GNAV_ADMIN_SV_STATUS_FRM");
        var versionStatSelect= jQuery(".GNAV_ADMIN_VS_STATUS_FRM");
        var t, tClone, tContent;
		if(!GNAV_SELECT.GNAV_SELECT_IS_MSIE){t=document.querySelector('template.GNAV_ADMIN_STATUS_RITM_TMPLT');}

        jQuery(surveyStatSelect).empty();
        jQuery(versionStatSelect).empty();

        var statInput, stat, statcnt, statElement, statContainer;
        var key;
        //<input type="radio" class="GNAV_ADMIN_STATUS_RITM"><span class="GNAV_ADMIN_STATUS_RITM_STAT"></span><span class="GNAV_ADMIN_STATUS_RITM_CNT"></span>
        var i, iM = GNAV_admin.allStatus.length;
        var exclusion=["not_accepted"];
        var sCount;
        var vCount=GNAV_admin.versionCount();
        for ( i = 0; i < iM; i += 1 ) {
            statElement=GNAV_admin.allStatus[i];
			if(GNAV_SELECT.GNAV_SELECT_IS_MSIE){tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_ADMIN_STATUS_RITM_TMPLT");}
			else{tClone=t.cloneNode(true, true);}
			
            tContent=tClone.content;
            statContainer=jQuery(tContent).find('div.GNAV_ADMIN_STATUS_RITM_C');
            statInput=jQuery(tContent).find('.GNAV_ADMIN_STATUS_RITM');
            stat=jQuery(tContent).find('.GNAV_ADMIN_STATUS_RITM_STAT');
            statcnt=jQuery(tContent).find('.GNAV_ADMIN_STATUS_RITM_CNT');
            for(key in statElement){
                if(statElement.hasOwnProperty(key)){
                    jQuery(statInput).attr(key, statElement[key]);
                    jQuery(statContainer).attr(key, statElement[key]);
                }
            }
            jQuery(stat).text(statElement.GNAV_VALUE);
            jQuery(statInput).attr('name','status_select_item');
            if(statElement.GNAV_CATEGORY=="survey_status" && exclusion.indexOf(statElement.GNAV_VALUE)==-1){
                sCount=GNAV_admin.surveyCount(statElement.GNAV_VALUE);
                if(sCount==0){jQuery(statContainer).addClass('zero');}
                else{jQuery(statContainer).removeClass('zero');}
                jQuery(statcnt).text(sCount);
                jQuery(surveyStatSelect).append(tContent);
                }
            if(statElement.GNAV_CATEGORY=="version_status" && exclusion.indexOf(statElement.GNAV_VALUE)==-1){
                if(vCount.hasOwnProperty(statElement.GNAV_VALUE)){
                    jQuery(statContainer).attr("svcnt", vCount[statElement.GNAV_VALUE]);
                }
                else{
                    jQuery(statContainer).attr("svcnt",0);
                    jQuery(statContainer).addClass('zero');
                }
                jQuery(versionStatSelect).append(tContent);
            }
        }
        
        jQuery('.GNAV_ADMIN_SV_STATUS_FRM').find('.GNAV_ADMIN_STATUS_RITM').change(function(){
            var selectForm= jQuery('form.GNAV_ADMIN_SV_STATUS_FRM');
            var select_option=GNAV_admin.getChecked(selectForm);
            //GNAV_admin.setVersionCount(select_option);
            jQuery('.GNAV_ADMIN_VS_STATUS_FRM').find('.GNAV_ADMIN_STATUS_RITM[GNAV_VALUE="all"]').prop("checked", true);
            GNAV_admin.fillSurveyList();
            
        });
        jQuery('.GNAV_ADMIN_VS_STATUS_FRM').find('.GNAV_ADMIN_STATUS_RITM').change(function(){
            var selectForm= jQuery('form.GNAV_ADMIN_VS_STATUS_FRM');
            var select_option=GNAV_admin.getChecked(selectForm);
            //GNAV_admin.setSurveyCount(select_option);
            //jQuery('.GNAV_ADMIN_SV_STATUS_FRM').find('.GNAV_ADMIN_STATUS_RITM[GNAV_VALUE="all"]').prop("checked", true);
            GNAV_admin.fillSurveyList();
        });
        jQuery('.GNAV_ADMIN_SV_STATUS_FRM').find('.GNAV_ADMIN_STATUS_RITM[GNAV_VALUE="all"]').prop("checked", true);
        jQuery('.GNAV_ADMIN_VS_STATUS_FRM').find('.GNAV_ADMIN_STATUS_RITM[GNAV_VALUE="all"]').prop("checked", true);
        jQuery('.GNAV_ADMIN_SV_STATUS_FRM').find('.GNAV_ADMIN_STATUS_RITM[GNAV_VALUE="all"]').trigger('change');
    },
    getChecked: function(formParent){
        var res="all";
        jQuery(formParent).find('.GNAV_ADMIN_STATUS_RITM').each(function(){
            if(jQuery(this).prop("checked")){res=jQuery(this).attr('GNAV_VALUE');}
        });
        return res;
    },
    fillSurveyList: function(SID, SVERSION) {
        var i, iM=GNAV_admin.allSurveys.length;
        var surveySel = document.querySelector("select.GNAV_ADMIN_SURVEY_SELECTOR");
        var selectForm= jQuery('form.GNAV_ADMIN_SV_STATUS_FRM');
        var version_select_form =jQuery('form.GNAV_ADMIN_VS_STATUS_FRM');
        jQuery(surveySel).empty();
        var key;
        var t, tClone, optionObject, tOption;
        var sidArray = [];
        var select_option=GNAV_admin.getChecked(selectForm);
        var v_select_option=GNAV_admin.getChecked(version_select_form);
        var surveyObject;
		
		if(!GNAV_SELECT.GNAV_SELECT_IS_MSIE){t=document.querySelector('template.GNAV_ADMIN_SELECT_ELEMENT');}
        //t = document.querySelector("template.GNAV_ADMIN_SELECT_ELEMENT");
        
        if(select_option=="all" && v_select_option=="all"){
            for ( i = 0; i < iM; i += 1 ) {
                surveyObject=GNAV_admin.allSurveys[i];
                if(surveyObject.SVERSION==surveyObject.maxVersion && surveyObject.hasOwnProperty('surveyName') && surveyObject.surveyName){
					if(GNAV_SELECT.GNAV_SELECT_IS_MSIE){tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_ADMIN_SELECT_ELEMENT");}
					else{tClone=t.cloneNode(true, true);}
					
					
                    //tClone = t.cloneNode(true, true);
                    tOption = tClone.content.querySelector("option.GNAV_ADMIN_OPTION_SURVEY"); 
                    for (key in surveyObject){
                        if(surveyObject.hasOwnProperty(key)){ jQuery(tOption).attr(surveyObject[key]);}
                    }
                    tOption.setAttribute("value", surveyObject.SID);
                    tOption.textContent = surveyObject.surveyName; 
                    jQuery(surveySel).append(tClone.content); 
                }
            }
        }
        else if(select_option!="all" && v_select_option=="all"){
            for ( i = 0; i < iM; i += 1 ) {
                surveyObject=GNAV_admin.allSurveys[i];
                tClone = t.cloneNode(true, true);
                tOption = tClone.content.querySelector("option.GNAV_ADMIN_OPTION_SURVEY");
                if(sidArray.indexOf(surveyObject.SID)==-1){
                    if(surveyObject.SURVEY_STATUS==select_option && surveyObject.hasOwnProperty('surveyName') && surveyObject.surveyName){
                        for (key in surveyObject){
                            if(surveyObject.hasOwnProperty(key)){ jQuery(tOption).attr(surveyObject[key]);}
                        }
                        tOption.setAttribute("value", surveyObject.SID);
                        tOption.textContent = surveyObject.surveyName; 
                        jQuery(surveySel).append(tClone.content); 
                        sidArray.push(surveyObject.SID);
                    }
                }
            }
        }
        else if(select_option=="all" && v_select_option!="all"){
            for ( i = 0; i < iM; i += 1 ) {
                surveyObject=GNAV_admin.allSurveys[i];
                if(surveyObject.version_status==v_select_option && sidArray.indexOf(surveyObject.SID)==-1 && surveyObject.hasOwnProperty('surveyName') && surveyObject.surveyName){
                    tClone = t.cloneNode(true, true);
                    tOption = tClone.content.querySelector("option.GNAV_ADMIN_OPTION_SURVEY");
                    for (key in surveyObject){if(surveyObject.hasOwnProperty(key)){ jQuery(tOption).attr(surveyObject[key]);}}
                    tOption.setAttribute("value", surveyObject.SID);
                    tOption.textContent = surveyObject.surveyName; 
                    jQuery(surveySel).append(tClone.content); 
                    sidArray.push(surveyObject.SID);
                }
            }
        }
        else if(select_option!="all" && v_select_option!="all"){
            for ( i = 0; i < iM; i += 1 ) {
                surveyObject=GNAV_admin.allSurveys[i];
                if(surveyObject.SURVEY_STATUS==select_option && surveyObject.version_status==v_select_option && sidArray.indexOf(surveyObject.SID)==-1){
                    tClone = t.cloneNode(true, true);
                    tOption = tClone.content.querySelector("option.GNAV_ADMIN_OPTION_SURVEY");
                    for (key in surveyObject){if(surveyObject.hasOwnProperty(key)){ jQuery(tOption).attr(surveyObject[key]);}}
                    tOption.setAttribute("value", surveyObject.SID);
                    tOption.textContent = surveyObject.surveyName; 
                    jQuery(surveySel).append(tClone.content); 
                    sidArray.push(surveyObject.SID);
                }
            }
        }
        
        if(SID && SVERSION){GNAV_admin.setSelectedSurvey(SID);}
        jQuery(surveySel).on("change", function(e){
            if(this.options.selectedIndex>-1){
                var mySid = surveySel.options[this.selectedIndex].value;
                var valUL = document.querySelector("ul#GNAV_ADMIN_SVAL_UL");
                var metaUL = document.querySelector("ul#GNAV_ADMIN_META_UL");
                GNAV_admin.currentSurvey=mySid;
                //GNAV_admin.setVersionCount(SVERSION);
                GNAV_admin.fillVersionSelector(mySid);

                jQuery(valUL).empty();
                jQuery(metaUL).empty();
                jQuery('button.GNAV_ADMIN_MANAGE_SURVEYSTATUS').removeClass('enabled');
            }
        });
        jQuery(surveySel).trigger("change");
    },
    setSurveyCount: function(version_status){
        var i, iM=GNAV_admin.allSurveys.length;
        var parentForm=jQuery('.GNAV_ADMIN_SV_STATUS_FRM');
        var surveyObject;
        var oVal, nVal;
        var tCount=0;
        jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_CNT').text("0");
        jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C').attr("svcnt",0);
        var statContainer;
        var SID_LIST=[];
        for ( i = 0; i < iM; i += 1 ) {
            surveyObject=GNAV_admin.allSurveys[i];
            if(surveyObject.version_status==version_status || version_status=="all"){
                if(SID_LIST.indexOf(surveyObject.SID)==-1){
                    statContainer=jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C[gnav_value="'+surveyObject.SURVEY_STATUS+'"]');
                    oVal=jQuery(statContainer).attr("svcnt");
                    nVal = Number(oVal)+1;
                    jQuery(statContainer).attr("svcnt", nVal);
                    jQuery(statContainer).find('.GNAV_ADMIN_STATUS_RITM_CNT').text(nVal);
                    SID_LIST.push(surveyObject.SID);
                    tCount+=1;
                }
            }
        }
        statContainer=jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C[gnav_value="all"]');
        jQuery(statContainer).attr("svcnt", tCount);
        jQuery(statContainer).find('.GNAV_ADMIN_STATUS_RITM_CNT').text(tCount);
        jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C').removeClass('zero');
        jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C[svcnt="0"]').addClass('zero');
    },
    setVersionCount: function(survey_status){
        var i, iM=GNAV_admin.allSurveys.length;
        var parentForm=jQuery('.GNAV_ADMIN_VS_STATUS_FRM');
        var surveyObject;
        var oVal, nVal;
        var tCount=0;
        //jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_CNT').text("0");
        jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C').attr("svcnt",0);
        var statContainer;
        for ( i = 0; i < iM; i += 1 ) {
            surveyObject=GNAV_admin.allSurveys[i];
            if(surveyObject.SURVEY_STATUS==survey_status || survey_status=="all"){
                statContainer=jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C[gnav_value="'+surveyObject.version_status+'"]');
                oVal=jQuery(statContainer).attr("svcnt");
                nVal = Number(oVal)+1;
                jQuery(statContainer).attr("svcnt", nVal);
                //jQuery(statContainer).find('.GNAV_ADMIN_STATUS_RITM_CNT').text(nVal);
                tCount+=1;
            }
        }
        statContainer=jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C[gnav_value="all"]');
        jQuery(statContainer).attr("svcnt", tCount);
        //jQuery(statContainer).find('.GNAV_ADMIN_STATUS_RITM_CNT').text(tCount);
        jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C').removeClass('zero');
        jQuery(parentForm).find('.GNAV_ADMIN_STATUS_RITM_C[svcnt="0"]').addClass('zero');
    },
    fillVersionSelector: function(SID, SVERSION){
        var selectForm= jQuery('form.GNAV_ADMIN_VS_STATUS_FRM');
        var select_option=GNAV_admin.getChecked(selectForm);
        var vsParent = jQuery('select.GNAV_ADMIN_SURVEY_VERSION_SEL');
        jQuery(vsParent).off('change');
        jQuery(vsParent).empty();
        var i, iM=GNAV_admin.allSurveys.length;
        for ( i = 0; i < iM; i += 1 ) {
            surveyObject=GNAV_admin.allSurveys[i];
            if(surveyObject.SID==SID){
                if(select_option=="all"){
                    GNAV_admin.insertVersion(surveyObject, vsParent);
                }
                else if(select_option==surveyObject.version_status){
                    GNAV_admin.insertVersion(surveyObject, vsParent);
                }
            }
        }
        jQuery(vsParent).on("change", function(e){
            if(this.options.selectedIndex>-1){
                var cVersion = this.options[this.selectedIndex].value;
                GNAV_admin.currentVersion = cVersion;
                jQuery('button.GNAV_ADMIN_SURVEY_SELECTOR_EXEC').trigger('click');
            }
        });
        
        if(SID && SVERSION){GNAV_admin.setSelectedSVersion(SVERSION);}
        else{jQuery(vsParent).prop("selectedIndex",0);}
        //jQuery(vsParent).trigger("change");
        if(jQuery(selectForm).children().length==1){jQuery('button.GNAV_ADMIN_SURVEY_SELECTOR_EXEC').trigger('click');}
    },
    insertVersion: function(SurveyElement, PARENT){
        var t = document.querySelector("template.GNAV_ADMIN_VERSION_SELECT_ELEMENT");
        var tClone = t.cloneNode(true, true);
        var tOptElement = tClone.content.querySelector('.GNAV_ADMIN_OPTION_VERSION');
        var vLine = SurveyElement.SVERSION + " (" + SurveyElement.version_status + ")";
        
        jQuery(tOptElement).attr('sid',SurveyElement.SID);
        jQuery(tOptElement).attr('sversion',SurveyElement.SVERSION);
        jQuery(tOptElement).attr('value',SurveyElement.SVERSION);
        jQuery(tOptElement).attr('status',SurveyElement.version_status);
        jQuery(tOptElement).addClass(SurveyElement.version_status);
        tOptElement.textContent = vLine;
        jQuery(tOptElement).addClass(SurveyElement.status);
        jQuery(PARENT).append(tClone.content);
    },
    reloadData: function(){
        // remove all old list items
        //var valUL = document.querySelector("ul#GNAV_ADMIN_SVAL_UL");
        //jQuery(valUL).children().remove();
        GNAV_admin.selectSurvey(GNAV_admin.currentSurvey, GNAV_admin.currentVersion);
    },
    selectSurvey: function(sID, sVersion){
        jQuery('.GNAV_ADMIN_SHEADER').removeClass('hasContent');
        GNAV_admin.isDrawing += 1;
        
        var mySurvey = GNAV_admin.getSurvey(sID, sVersion);
        var MyVersionStatus = mySurvey.version_status;
        
        GNAV_admin.currentSurvey=sID;
        GNAV_admin.currentVersion=sVersion;
               
        var i, iM;
        var scoreArray=[]; 
        var metaArray= [];
        var valUL = document.querySelector("ul#GNAV_ADMIN_SVAL_UL");
        var metaUL = document.querySelector("ul#GNAV_ADMIN_META_UL");
        
        jQuery('.GNAV_ADMIN_SURVEY_STATUS').text(MyVersionStatus);
        var EditStatus = ['in_process','new'];
        GNAV_MAIN.show_spinner();
        jQuery('.overlay').addClass('hideContent');
        
        var drawQueue;
        var gSV = d3_queue.queue()
            .defer(GNAV_admin.getAllValues, sID, sVersion)
            .await(function(error, data){
                jQuery('.overlay').removeClass('hideContent');
                GNAV_MAIN.remove_spinner();
                if(error){
                    GNAV_admin.currentSurvey=false;
                    GNAV_admin.currentVersion=false;
                    throw error;}
                iM = data.length;
                for (i=0; i<iM; i+=1){
                    if(GNAV_admin.isMetaElement(data[i])){metaArray.push(data[i]);}
                    else{scoreArray.push(data[i]);}
                }
                GNAV_admin.currentScores=scoreArray;
                GNAV_admin.currentMeta=metaArray;
                jQuery(valUL).empty();
                jQuery(metaUL).empty();
                jQuery(valUL).collapse('show');
                jQuery(metaUL).collapse('show');
                
                jQuery('.GNAV_ADMIN_SHEADER').addClass('hasContent');
                GNAV_admin.insertCatChildren(GNAV_admin.GNAV_ROOT, valUL, 0);
                GNAV_admin.insertMetaItems(metaUL);
            });
        GNAV_admin.isDrawing -= 1;
        GNAV_admin.setAct();
    },
    insertCatChildren: function(parentCatID, parentElement, lvl){
        GNAV_admin.isDrawing += 1;
        var myChildren = GNAV_admin.getCatChildren(parentCatID);
        var i, iM = myChildren.length;
        var childCatID, childListElement;
        for (i=0; i<iM; i+=1){
            childCatID=myChildren[i].GNAV_SCAT;
            //1. add the GNAV_SCAT first
            if(!myChildren[i].hasOwnProperty('GNAV_MCAT') || !myChildren[i].GNAV_MCAT || myChildren[i].GNAV_MCAT=="null"){
                GNAV_admin.insertCat(childCatID, parentElement, lvl);
            }
        }
        GNAV_admin.isDrawing -= 1;
        GNAV_admin.setAct();
        
    },
    insertCat: function(catID, parentElement,lvl, callback){
        GNAV_admin.isDrawing += 1;
        var cEl = GNAV_admin.getCatDef(catID);
        var t = document.querySelector("template.GNAV_ADMIN_SCORE_HEAD");
        var tClone = t.cloneNode(true, true);
        var sLi = tClone.content.querySelector("li.GNAV_ADMIN_SCORE_VALID_CNT");
        var sSD = tClone.content.querySelector("span.GNAV_ADMIN_SCORE_ELEMENT");
        var addIMG = tClone.content.querySelector("img.GNAV_ADMIN_addIC");
        var catUL=tClone.content.querySelector('ul.GNAV_ADMIN_SCORE_VALID_UL');
        var key;
        for (key in cEl){
            if(cEl.hasOwnProperty(key) && cEl[key]){
                sLi.setAttribute(key, cEl[key]);
                addIMG.setAttribute(key, cEl[key]);
            }
        }
        jQuery(addIMG).attr('src', GNAV_admin_local.addIcon); 
        jQuery(sLi).addClass("GN_LVL_" + lvl);
        sSD.textContent = cEl.GNAV_DESCRIPTION;
        jQuery(sSD).addClass("catHeader");
        GNAV_admin.insertCatValues(catID, catUL); 
        GNAV_admin.insertCatChildren(catID,catUL,lvl+1, callback);
        jQuery(parentElement).append(tClone.content);
        GNAV_admin.isDrawing -= 1;
        GNAV_admin.setAct();
    },
    insertCatValues: function(catID, parentElement){
        GNAV_admin.isDrawing += 1;
        var oValues = GNAV_admin.getOrigValues(catID);
        var oValue;
        var i, iM = oValues.length;
        if ( iM==0 ){
            jQuery('li.GNAV_ADMIN_SCORE_VALID_CNT[scat="'+catID+'"]').children('input.GNAV_ADMIN_ACCEPT_SCORE_ALL').addClass('noChild');
            jQuery('li.GNAV_ADMIN_SCORE_VALID_CNT[scat="'+catID+'"]').children('label.GNAV_ADMIN_ACCEPT_LABEL').addClass('noChild');
        }
        else{
            for ( i = 0; i < iM; i += 1) {
                oValue = oValues[i];
                GNAV_admin.insertCatValue(oValue, parentElement);
            }
        }
        GNAV_admin.isDrawing -= 1;
        GNAV_admin.setAct();
    },
    insertCatValue: function(oValue, parentElement){
        GNAV_admin.isDrawing += 1;
        var t = document.querySelector("template.GNAV_ADMIN_SCORE_VALID");
        var tClone = t.cloneNode(true, true);
        var sLi = tClone.content.querySelector("li.GNAV_ADMIN_SCORE_VALID_CNT");
        var sSD = tClone.content.querySelector("span.GNAV_ADMIN_SCORE_ELEMENT");
        var sDC = tClone.content.querySelector("span.GNAV_ADMIN_SCORE_DCAT");
        var sSelect= tClone.content.querySelector("select.GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT");
        var remIcon = tClone.content.querySelector("img.GNAV_ADMIN_remVal");
        var key;
        for (key in oValue){
            if(oValue.hasOwnProperty(key)){
                sLi.setAttribute(key, oValue[key]);
                sSelect.setAttribute(key, oValue[key]);
            }
        }
        remIcon.setAttribute('src',GNAV_admin_local.removeIcon);
        if (oValue.hasOwnProperty("GNAV_DCAT") && oValue.GNAV_DCAT && oValue.GNAV_DCAT.length>0){
            sDC.textContent=oValue.GNAV_DCAT;
            jQuery(sDC).addClass("hasDataCat");
            if(oValue.GNAV_DCAT=="YNQuestion"){sDC.textContent=oValue.GNAV_YNQUESTION_DESC;}
        }
        if(oValue.GNAV_VALUE.length>8){
            jQuery(sSD).addClass('GNAV_ADMIN_SHORT_VALUE');
            jQuery(sSD).attr('longVal',oValue.GNAV_VALUE);
            sSD.textContent=oValue.GNAV_VALUE.substring(0,8);
            jQuery(this).prop('data-content',oValue.GNAV_VALUE);
        }
        else{
            sSD.textContent = oValue.GNAV_VALUE;
        }
        GNAV_admin.fillValueSelectOptions(sSelect, oValue.GNAV_VALUE_TYPE);
        GNAV_admin.setSelectedOption(sSelect,oValue.GNAV_VALUE);
        jQuery(parentElement).append(tClone.content);
        GNAV_admin.isDrawing -= 1;
        GNAV_admin.setAct();
    },
    insertMetaItems: function(parentElement){
        GNAV_admin.isDrawing += 1;
        var i, iM=GNAV_admin.allMeta.length;
        var t = document.querySelector("template.GNAV_ADMIN_META_HEAD");
        var tClone, tContent;
        var mLi, mEl, addIMG, mUL;

        var key, mcat;
        for (i=0; i<iM; i+=1){
            mcat= GNAV_admin.allMeta[i];
            tClone = t.cloneNode(true, true);
            tContent = tClone.content;
            mLi = tContent.querySelector("li.GNAV_ADMIN_META_VALID_CNT");
            mEl = tContent.querySelector("span.GNAV_ADMIN_META_ELEMENT");
            addIMG = tContent.querySelector("img.GNAV_ADMIN_META_addIC");
            mUL = tContent.querySelector("ul.GNAV_ADMIN_META_ITEM_LIST");
            for (key in mcat){
                if (mcat.hasOwnProperty(key) && (mcat[key]!="null"||!mcat[key])){
                    mLi.setAttribute(key,mcat[key]);
                }
            }
            jQuery(mLi).addClass('GN_LVL0');
            jQuery(mEl).text(mcat.GNAV_DESCRIPTION);
            addIMG.setAttribute('src',GNAV_admin_local.addIcon);
            GNAV_admin.insertMetaValues(mcat.GNAV_VALUE, mUL);
            jQuery(parentElement).append(tContent);
        }
        GNAV_admin.isDrawing -= 1;
        GNAV_admin.setAct();
    },
    insertMetaValues: function(metaCat, parentElement){
        GNAV_admin.isDrawing += 1;
        var mValues=GNAV_admin.getMyMetaItems(metaCat);
        var i, iM = mValues.length;
        var t = document.querySelector("template.GNAV_ADMIN_META_VALID");
        var tClone, tContent;
        var miLi, miEl, mSel, mIP_text, mIP_textArea, remIMG;
        var textTypes = ["general_text","URL"];
        var mkey;
        for (i=0; i<iM; i+=1){
            cMetaItem=mValues[i];
            
            tClone = t.cloneNode(true, true);
            tContent = tClone.content;
            
            miLi= tContent.querySelector("li.GNAV_ADMIN_META_VALID_CNT");
            miEl = tContent.querySelector("span.GNAV_ADMIN_META_VAL");
            mSel = tContent.querySelector('select.GNAV_ADMIN_META_NEW_TEXT');
            mIP_text = tContent.querySelector('input.GNAV_ADMIN_META_NEW_TEXT[type="text"]');
            mIP_textArea = tContent.querySelector('textarea.GNAV_ADMIN_META_NEW_TEXT');
            remIMG = tContent.querySelector('.GNAV_ADMIN_META_remVal');
            
            for (mkey in cMetaItem){
                if(cMetaItem.hasOwnProperty(mkey) && cMetaItem[mkey]){
                    miLi.setAttribute(mkey,cMetaItem[mkey]);
                }
            }
            jQuery(miLi).addClass('GN_LVL1');
            remIMG.setAttribute('src',GNAV_admin_local.removeIcon);
            
            if(cMetaItem.GNAV_VALUE_TYPE=="long_text"){
                jQuery(mIP_text).remove();
                jQuery(mSel).remove();
                jQuery(mIP_textArea).val(cMetaItem.GNAV_VALUE_LT);
            }
            else if(textTypes.indexOf(cMetaItem.GNAV_VALUE_TYPE)>-1){
                jQuery(mSel).remove();
                if(cMetaItem.GNAV_VALUE_DESC.length>60){
                    jQuery(mIP_text).remove();
                    jQuery(mIP_textArea).val(cMetaItem.GNAV_VALUE_DESC);
                }
                else{
                    jQuery(mIP_textArea).remove();
                    jQuery(mIP_text).val(cMetaItem.GNAV_VALUE_DESC);
                }
            }
            else{
                GNAV_admin.fillMetaOptions(mSel, cMetaItem.GNAV_VALUE_TYPE);
                GNAV_admin.setSelectedMetaOption(mSel, cMetaItem.GNAV_VALUE);
                jQuery(mIP_textArea).remove();
                jQuery(mIP_text).remove();
            }
            jQuery(parentElement).append(tContent);
        }
        GNAV_admin.isDrawing -= 1;
        GNAV_admin.setAct();

    },
    insertEmptyMetaValue: function(parentElement, valType, MetaCat){
        var textTypes = ["general_text", "long_text", "URL" ];
        var valueTypes=["country_ISO3", "general_text", "long_text", "Organization", "URL", "Year"];
        var dropDownTypes=["country_ISO3", "Organization", "Year"];
        
        var t = document.querySelector("template.GNAV_ADMIN_META_VALID");
        var tClone = t.cloneNode(true, true);
        var tContent = tClone.content;
        var mLi= tContent.querySelector("li.GNAV_ADMIN_META_VALID_CNT");
        var remIMG = tContent.querySelector('.GNAV_ADMIN_META_remVal');
        var mSel = tContent.querySelector('select.GNAV_ADMIN_META_NEW_TEXT');
        var mIP_text = tContent.querySelector('input.GNAV_ADMIN_META_NEW_TEXT[type="text"]');
        var mIP_textArea = tContent.querySelector('textarea.GNAV_ADMIN_META_NEW_TEXT');
        var myUNDO = tContent.querySelector('.GNAV_ADMIN_ADDNEW_META_UNDO'); 
        var metaDef = GNAV_admin.getMetaDef(MetaCat);
        var key;
        
        for (key in metaDef){
            if(metaDef.hasOwnProperty(key)){
                mLi.setAttribute(key,metaDef[key]);
            }
        }
        
        mLi.setAttribute('tid',-1);
        mLi.setAttribute('gnav_mcat', MetaCat);
        mLi.setAttribute('MetaVal',"");
        mLi.setAttribute('MetaVal_type', valType);
        mLi.setAttribute('MetaVal_Definition',"");
        
        jQuery(mLi).addClass('GN_LVL1');
        jQuery(mLi).addClass('newMeta');
        jQuery(myUNDO).addClass('confirm');
        
        jQuery(remIMG).remove();
       
        if(textTypes.indexOf(valType)>-1){
            jQuery(mSel).remove();
            if(valType==textTypes[1]){jQuery(mIP_text).remove();}
            else{jQuery(mIP_textArea).remove();}
        }
        else{
            jQuery(mIP_textArea).remove();
            jQuery(mIP_text).remove();
            GNAV_admin.fillMetaOptions(mSel, valType);
        }            
        jQuery(parentElement).append(tContent);
        GNAV_admin.setAct();
    },
    insertEmptyValue: function(parentElement, SID, sVersion, sCat){
        var t = document.querySelector("template.GNAV_ADMIN_SCORE_VALID");
        var tClone = t.cloneNode(true, true);
        var sLi = tClone.content.querySelector("li.GNAV_ADMIN_SCORE_VALID_CNT");
        var sSelect= tClone.content.querySelector("select.GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT");
        var sSelectLabel = tClone.content.querySelector("label.GNAV_ADMIN_ACCEPT_LABEL");
        var sUndo = tClone.content.querySelector("span.GNAV_ADMIN_ADDNEW_UNDO");
        var rImg = tClone.content.querySelector("img.GNAV_ADMIN_remVal");
        //var myDT = GNAV_admin.getDataType(sCat);
        
        sLi.setAttribute('sid', SID);
        sLi.setAttribute('sversion', sVersion);
        sLi.setAttribute('gnav_scat', sCat);
        sLi.setAttribute('gnav_value',"");
        //sLi.setAttribute('gnav_value_type', myDT);
        
        jQuery(sLi).addClass('newValue');
        
        sSelect.setAttribute('sID', SID);
        sSelect.setAttribute('gnav_scat', sCat);
        
        jQuery(sSelectLabel).addClass('newValue');
        jQuery(sSelectLabel).addClass('enabled');
        jQuery(sSelect).addClass('enabled');
        jQuery(sSelect).addClass('newValue');
        jQuery(sUndo).addClass('confirm');
        
        GNAV_admin.fillValueSelectOptions(sSelect, "all");
        
        jQuery(rImg).remove();
        jQuery(parentElement).prepend(tClone.content);
        //var myListItem = jQuery('li.GNAV_ADMIN_SCORE_VALID_CNT[sCat="'+sCat+'"][sval=""]');
        GNAV_admin.setAct();
    },
    fillValueSelectOptions: function(valueSelector, dataType){
        var i, iM;
        var opt, iDEF;
        var tDCat, iVal;
        var opt_Text;
        var myListElement = jQuery(valueSelector).parent();
        var mySID = jQuery(valueSelector).parent().attr('sid');
        var mySCat = jQuery(myListElement).attr('gnav_scat');
        var myDCat = jQuery(myListElement).attr('gnav_dcat');
        var key;
        var tS;
        
        var DCAT_LIST=[];
        var INS_VAL_LIST=[];
        var dDef;
        var d, dM=GNAV_admin.dataCatDefs.length;
        for(d=0;d<dM;d+=1){
            dDef=GNAV_admin.dataCatDefs[d];
            if(dDef.hasOwnProperty('GNAV_VALUE') && dDef.GNAV_VALUE){
                DCAT_LIST.push(dDef.GNAV_VALUE);
            }
        }
        iM = GNAV_admin.scoreDefs.length;

        // GNAV_VALUE, GNAV_CATEGORY, GNAV_VALUE_TYPE, GNAV_DESCRIPTION, GNAV_MCAT
        for ( i = 0; i < iM; i += 1){
            iDEF = GNAV_admin.scoreDefs[i];
            if(iDEF.GNAV_VALUE_TYPE==myDCat || (dataType=="all" && DCAT_LIST.indexOf(iDEF.GNAV_VALUE_TYPE)!=-1 && iDEF.GNAV_VALUE_TYPE!="YNQuestion")){
                INS_VAL_LIST.push(iDEF);
            }
        }
        
        var INS_VAL_LIST_SORT=INS_VAL_LIST.sort(GNAV_admin.SortByDCatValue);
        
        iM=INS_VAL_LIST_SORT.length;
        for ( i = 0; i < iM; i += 1){
            iDEF=INS_VAL_LIST_SORT[i];
            opt = document.createElement("option");
            jQuery(opt).addClass('GNAV_ADMIN_VAL_OPT');
            for (key in iDEF){
                if(iDEF.hasOwnProperty(key)){opt.setAttribute(key, iDEF[key]);}
            }
            
            jQuery(opt).attr('GNAV_SCAT', mySCat);
            jQuery(opt).attr('gnav_value_type', iDEF.GNAV_VALUE_TYPE);
            jQuery(opt).attr('gnav_category', 'GNAV_SVAL');
            jQuery(opt).attr('gnav_ynquestion','null');

            opt.setAttribute("value",i);
            if(dataType=="all"){opt.textContent = iDEF.GNAV_VALUE + " ("+iDEF.GNAV_VALUE_TYPE + ")"; }
            else{opt.textContent = iDEF.GNAV_VALUE;}
            jQuery(valueSelector).append(opt);
        }            
    },
    setSelectedOption: function(selectElement, sVal){
        var allOptions = jQuery(selectElement).children();
        var i, iM = allOptions.length;
        var cOpt;
        var sIndex;
        for ( i = 0; i < iM; i += 1 ) {
            cOpt = allOptions[i];
            if(jQuery(cOpt).attr('gnav_value')==undefined){return;}
            if(jQuery(cOpt).attr('gnav_value')==sVal){
                sIndex = i;
                jQuery(selectElement).prop('selectedIndex',sIndex);
                return;
            }
        }
    },
    fillMetaOptions: function(valueSelector, dataType){
        var dropDownTypes=["country_ISO3", "Organization", "Year"];
        var key;
        if(dataType == "Organization"){
            iM = GNAV_admin.allOrganizations.length;
            for ( i = 0; i < iM; i += 1){
                iDEF = GNAV_admin.allOrganizations[i];
                opt = document.createElement("option");
                for (key in iDEF){
                    if(iDEF.hasOwnProperty(key) && iDEF[key]){
                        opt.setAttribute(key, iDEF[key]);
                    }
                }
                opt.setAttribute("metaval",iDEF.GNAV_VALUE);
                opt.setAttribute("value",i);
                opt_Text = iDEF.GNAV_VALUE;
                if(iDEF.GNAV_VALUE !=iDEF.GNAV_DESCRIPTION){opt_Text = iDEF.GNAV_VALUE + " (" +  iDEF.GNAV_DESCRIPTION + ")";}
                opt.textContent = opt_Text;
                jQuery(valueSelector).append(opt);
            }
        }
        else if(dataType == "country_ISO3"){
            iM = GNAV_admin.allCountries.length;
            for ( i = 0; i < iM; i += 1){
                iDEF = GNAV_admin.allCountries[i];
                opt = document.createElement("option");
                for (key in iDEF){
                    if(iDEF.hasOwnProperty(key) && iDEF[key]){
                        opt.setAttribute(key, iDEF[key]);
                    }
                }
                opt.setAttribute("metaval",iDEF.GNAV_VALUE);
                opt.setAttribute("value",i);
                opt_Text = iDEF.GNAV_VALUE + " (" +  iDEF.GNAV_DESCRIPTION + ")";
                opt.textContent = opt_Text;
                jQuery(valueSelector).append(opt);
            }
        }
        else if(dataType == "Year"){
            var curYear = new Date().getFullYear();
            i = curYear-50;
            iM = curYear+1;
            var x=0;
            for ( i; i < iM; i += 1){
                opt = document.createElement("option");
                opt.setAttribute("metaval", i);
                opt.setAttribute("value", x);
                opt.setAttribute("gnav_value", i);
                opt.textContent=i;
                jQuery(valueSelector).append(opt);
                x+=1;
            }
        }
        else{
            return;
        }
    },
    setSelectedMetaOption: function(selectElement, GNAV_VALUE){
        var allOptions = jQuery(selectElement).children();
        var i, iM = allOptions.length;
        var cOpt;
        var sIndex;
        for ( i = 0; i < iM; i += 1 ) {
            cOpt = allOptions[i];
            //if(jQuery(cOpt).attr('GNAV_VALUE')==undefined){return;}
            if(jQuery(cOpt).attr('gnav_value')==GNAV_VALUE){
                jQuery(cOpt).addClass('GNAV_ORG_VALUE');
                sIndex = i;
                jQuery(selectElement).prop('selectedIndex',sIndex);
                return;
            }
        }
    },
    /***********************************/
    /*******  set functionality ********/
    /***********************************/
    setAct: function(){
        if(GNAV_admin.isDrawing==0){
            var t0 = performance.now();
          
            //GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT 
            //*** get rid of old click events to prevent multiple instances ***//
            jQuery('img.GNAV_ADMIN_addIC').off('click');
            jQuery('span.GNAV_ADMIN_ADDNEW_UNDO').off('click');
            jQuery('img.GNAV_ADMIN_remVal').off('click');
            jQuery('span.GNAV_ADMIN_rem_confirm').off('click');
            jQuery('span.GNAV_ADMIN_rem_cancel').off('click');
            jQuery('button.GNAV_ADMIN_CHANGE_SCORE_EXEC ').off('click');
            jQuery('span.GNAV_ADMIN_SCHANGE_confirm').off('click');
            jQuery('span.GNAV_ADMIN_SCHANGE_cancel').off('click');
            jQuery('.GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT').off('change');
            jQuery('span.GNAV_ADMIN_SCORE_SPECIAL_SCHANGE_cancel').off('click');
            jQuery('button.GNAV_ADMIN_SCORE_SPECIAL_CHANGE_EXEC').off('click');
            jQuery('span.GNAV_ADMIN_SCORE_SPECIAL_SCHANGE_confirm').off('click');
            jQuery('img.GNAV_ADMIN_SCORE_SPECIAL_remVal').off('click'); 
            jQuery('span.GNAV_ADMIN_SCORE_SPECIAL_rem_cancel ').off('click'); 
            jQuery('span.GNAV_ADMIN_SCORE_SPECIAL_rem_confirm ').off('click'); 
            jQuery('select.GNAV_ADMIN_SCORE_SPECIAL_NEW_TEXT').off('click');
            jQuery('.GNAV_ADMIN_META_CHANGE_EXEC').off('click');
            jQuery('.GNAV_ADMIN_META_SCHANGE_cancel').off('click');
            jQuery('img.GNAV_ADMIN_META_remVal').off('click');
            jQuery('.GNAV_ADMIN_META_rem_cancel').off('click');
            jQuery('img.GNAV_ADMIN_META_addIC').off('click');
            jQuery('.GNAV_ADMIN_ADDNEW_META_UNDO').off('click');
            jQuery('.GNAV_ADMIN_META_rem_confirm').off('click');
            jQuery('.GNAV_ADMIN_META_SCHANGE_confirm').off('click');
            jQuery('#GNAV_ADMIN_SEARCH_META_INPUT').off('input');
            jQuery('button.GNAV_ADMIN_SURVEY_SELECTOR_ADD_VERSION').off('click');
            jQuery('button.GNAV_ADMIN_SET_PENDING').off('click');
            jQuery('.GNAV_ADMIN_META_NEW_TEXT').off('change');
            jQuery('button.GNAV_ADMIN_MANAGE_SURVEYSTATUS').off('click');
            //GNAV_ADMIN_SCHANGE_confirm 
            /*** score value activity ***/
            //*** insert a new value ***
            jQuery('img.GNAV_ADMIN_addIC').click(function(){
                var sCat = jQuery(this).attr('gnav_scat');
                var parentListElement=jQuery(this).parent('li.GNAV_ADMIN_SCORE_VALID_CNT');
                var childList=jQuery(parentListElement).children('ul.GNAV_ADMIN_SCORE_VALID_UL').first();
                if(GNAV_admin.countNewVal(sCat)==0){
                    var mySID = GNAV_admin.currentSurvey;
                    var cVersion = GNAV_admin.currentVersion;
                    GNAV_admin.insertEmptyValue(childList, mySID, cVersion, sCat);
                    //}
                }
            });
            jQuery('span.GNAV_ADMIN_ADDNEW_UNDO').click(function(){
                var myListElement = jQuery(this).parent();
                jQuery(myListElement).remove();
            });
            // *** remove a value ***
            jQuery('img.GNAV_ADMIN_remVal').click(function(){
                var myListElement = jQuery(this).parent();
                var myConfirm = myListElement.children('span.GNAV_ADMIN_rem_confirm');
                var myCancel = myListElement.children('span.GNAV_ADMIN_rem_cancel');
                jQuery(myConfirm).addClass('confirm');
                jQuery(myCancel).addClass('confirm');
                jQuery(myListElement).children('span.GNAV_ADMIN_SCHANGE_confirm').removeClass('confirm');
                jQuery(myListElement).children('span.GNAV_ADMIN_SCHANGE_cancel').removeClass('confirm');
                jQuery(myListElement).children('GNAV_ADMIN_CHANGE_SCORE_EXEC').removeClass('hasChange');
            });
            jQuery('span.GNAV_ADMIN_rem_confirm').click(function(){
                if(!jQuery(this).hasClass('confirm')){return;}
                var myListElement = jQuery(this).parent();
                var mySID = jQuery(myListElement).attr('sid');
                var sCat = jQuery(myListElement).attr('gnav_scat');
                var sVersion= jQuery(myListElement).attr('sVersion');
                var dCat = "";
                var YNQ = "";
                if (myListElement.attr('gnav_dcat')!=undefined){ dCat = jQuery(myListElement).attr('gnav_dcat');}
                if (myListElement.attr('gnav_ynquestion')!=undefined){ YNQ = jQuery(myListElement).attr('YNQ');}
                var sVal = jQuery(myListElement).attr('gnav_value');
                var sType = jQuery(myListElement).attr('gnav_value_type');
                var sDataArray = [mySID,sVersion,[sCat, dCat, YNQ, sVal, sType],["-1","-1","-1","-1","-1"]];
                var rQ = d3_queue.queue(1)
                    .defer(GNAV_admin.sendSingleChange,sDataArray)
                    .await(function(error, data){
                        GNAV_admin.reloadData();
                    });
            });
            jQuery('span.GNAV_ADMIN_rem_cancel').click(function(){
                var myListElement = jQuery(this).parent();
                var myConfirm = myListElement.children('span.GNAV_ADMIN_rem_confirm');
                var myCancel = myListElement.children('span.GNAV_ADMIN_rem_cancel');
                jQuery(myConfirm).removeClass('confirm');
                jQuery(myCancel).removeClass('confirm');
            });
            // *** change a value ***
            jQuery('select.GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT').change(function(){
                var optVal, orgVal, optDCat, orgDCat;
                var myINDEX = this.selectedIndex;
                var allOptions = jQuery(this).children('option');
                var selectOpt = allOptions[myINDEX];
                var myParent = jQuery(this).parent(".GNAV_ADMIN_SCORE_VALID_CNT");
                var myConfirm = jQuery(myParent).children('span.GNAV_ADMIN_SCHANGE_confirm');
                var myCancel = jQuery(myParent).children('span.GNAV_ADMIN_SCHANGE_cancel');
                /*
                <select class="GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT UR_DEPENDENT" tid="68159" sid="1586161717" sversion="0.1" gnav_value="2" val_definition="Questions are about specific member(s) of the household or all members of certain age" gnav_value_type="scoreValue" gnav_scat="24c30883346d88f5dd716358e8961f7d" gnav_dcat="Question/Response Type" gnav_mcat="null" gnav_ynquestion="null" gnav_ynquestion_desc="null" ndcat="">
                <option class="GNAV_ADMIN_VAL_OPT" gnav_value="1" gnav_value_type="scoreValue" gnav_value_subtype="Question/Response Type" gnav_description="Respondent(s) asked who has certain rights and responsibilities. Question responses allow for at least one person ID code or other identifying information or are linked to this information through the plot ID, livestock ID, enterprise ID, etc." value="0">1</option>
                */
                orgVal = jQuery(myParent).attr('gnav_value');
                orgDCat = jQuery(myParent).attr('gnav_dcat');
                optVal = jQuery(selectOpt).attr('gnav_value');
                optDCat = jQuery(selectOpt).attr('gnav_value_type');
                jQuery(this).attr('nsval',optVal);
                if(optDCat!=undefined){ jQuery(this).attr('ndcat',optDCat);}
                else{jQuery(this).attr('ndcat',"");}
                if(orgVal!=optVal || orgDCat!=optDCat){
                    myParent.children('.GNAV_ADMIN_CHANGE_SCORE_EXEC').addClass('hasChange');
                    myParent.children('.GNAV_ADMIN_CHANGE_SCORE_REMARK').addClass('hasChange');
                    //jQuery(myConfirm).addClass('confirm');
                    jQuery(myCancel).addClass('confirm');
                }
                else if( orgVal==optVal && ((orgDCat==undefined && optDCat==undefined) || (orgDCat==optDCat))){
                    myParent.children('.GNAV_ADMIN_CHANGE_SCORE_EXEC').removeClass('hasChange');
                    myParent.children('.GNAV_ADMIN_CHANGE_SCORE_REMARK').removeClass('hasChange');
                    jQuery(myConfirm).removeClass('confirm');
                    jQuery(myCancel).removeClass('confirm');
                }
                jQuery(this).removeClass('newValue');
                jQuery(myParent).children('.GNAV_ADMIN_ADDNEW_UNDO').removeClass('confirm'); 
            });
            jQuery('button.GNAV_ADMIN_CHANGE_SCORE_EXEC ').click(function(){
                var myElement = jQuery(this).parent(".GNAV_ADMIN_SCORE_VALID_CNT");
                jQuery(myElement).children('span.GNAV_ADMIN_SCHANGE_confirm').addClass('confirm');
                jQuery(myElement).children('span.GNAV_ADMIN_SCHANGE_cancel').addClass('confirm');
                jQuery(myElement).children('span.GNAV_ADMIN_rem_confirm').removeClass('confirm');
                jQuery(myElement).children('span.GNAV_ADMIN_rem_cancel').removeClass('confirm');
            });
            jQuery('span.GNAV_ADMIN_SCHANGE_confirm').click(function(){
                var myElement = jQuery(this).parent(".GNAV_ADMIN_SCORE_VALID_CNT");
                var mySelect = myElement.children('.GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT');
                //var myINDEX = jQuery(mySelect).selectedIndex;

                var selectOpt = jQuery(mySelect).children("option:selected");
                //var selectOpt = allOptions[myINDEX];
                
                
                var tODCat, tNDCat;
                var tOSVAL, tNSVAL;
                var oValue, newValue;
                                
                var mySID = jQuery(myElement).attr('sid');
                var sVersion = jQuery(myElement).attr('sVersion');
                var SCat = jQuery(myElement).attr('gnav_scat');
                var sType = jQuery(selectOpt).attr('gnav_value_type');
                /*
                <select class="GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT UR_DEPENDENT" tid="68159" sid="1586161717" sversion="0.1" gnav_value="2" val_definition="Questions are about specific member(s) of the household or all members of certain age" gnav_value_type="scoreValue" gnav_scat="24c30883346d88f5dd716358e8961f7d" gnav_dcat="Question/Response Type" gnav_mcat="null" gnav_ynquestion="null" gnav_ynquestion_desc="null" nsval="3" ndcat="Question/Response Type">
                */
                
                nValue = {
                        "SCat": SCat,
                        "DCat": jQuery(mySelect).attr('ndcat'),
                        "YNQuestion": jQuery(mySelect).attr('gnav_ynquestion'),
                        "SVal": jQuery(mySelect).attr('nsval'),
                        "SVAL_TYPE": sType
                    };
                if(jQuery(myElement).hasClass('newValue') && jQuery(myElement).attr('gnav_value')==""){
                    // new value
                    oValue ={
                        "SCat": "-1",
                        "DCat": "-1",
                        "YNQuestion": "-1",
                        "SVal": "-1",
                        "SVAL_TYPE": "-1"
                    };
                }
                else{
                    oValue ={
                        "SCat": SCat,
                        "DCat": jQuery(myElement).attr('gnav_dcat'),
                        "YNQuestion": jQuery(mySelect).attr('gnav_ynquestion'),
                        "SVal": jQuery(myElement).attr('gnav_value'),
                        "SVAL_TYPE": sType
                    };
                }
                    
                if(GNAV_admin.objectsEqual(oValue,nValue)){return;}
                if(GNAV_admin.scoreExists(nValue.SCat, nValue.DCat, nValue.SVal)){
                    alert('this score already exists for this survey');
                    return;
                }
                // execute change
                var sARRAY = [mySID,sVersion,[oValue.SCat, oValue.DCat, oValue.YNQuestion ,oValue.SVal, oValue.SVAL_TYPE],[nValue.SCat,nValue.DCat,oValue.YNQuestion, nValue.SVal,nValue.SVAL_TYPE]];
                var Q = d3_queue.queue(1)
                    .defer(GNAV_admin.sendSingleChange, sARRAY)
                    .await(function(error, returnData){
                        GNAV_admin.reloadData();
                    });
                });
            jQuery('span.GNAV_ADMIN_SCHANGE_cancel').click(function(){
                var myElement = jQuery(this).parent(".GNAV_ADMIN_SCORE_VALID_CNT");
                if(jQuery(myElement).hasClass('newValue')){
                    jQuery(myElement).remove();}
                else{
                    jQuery(myElement).removeClass('hasChange');
                    jQuery(myElement).children('.GNAV_ADMIN_SCHANGE_confirm').removeClass('hasChange');
                    jQuery(myElement).children('.GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT').removeAttr('nsval');
                    jQuery(myElement).children('.GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT').removeAttr('ndcat');
                    jQuery(myElement).children('.GNAV_ADMIN_CHANGE_SCORE_EXEC').removeClass('hasChange');
                    jQuery(myElement).children('.GNAV_ADMIN_CHANGE_SCORE_REMARK').removeClass('hasChange');
                    jQuery(myElement).children('.GNAV_ADMIN_SCHANGE_confirm').removeClass('confirm');
                    jQuery(this).removeClass('confirm');
                }
            });
            /*** meta items activity ***/
            jQuery('.GNAV_ADMIN_META_NEW_TEXT').change(function(){
                var myElement = jQuery(this).parent();
                var myValue = jQuery(myElement).attr('metaval');
                var myApplyButton = jQuery(myElement).children('button.GNAV_ADMIN_META_CHANGE_EXEC');
                var myCancel = jQuery(myElement).children('span.GNAV_ADMIN_META_SCHANGE_cancel'); 
                if(jQuery(this).val()!=myValue){jQuery(myApplyButton).addClass('hasChange');}
                else if(jQuery(this).val()==myValue){
                    jQuery(myApplyButton).removeClass('hasChange');
                    jQuery(myCancel).removeClass('confirm');
                    }
                else if(jQuery(this).val() =="" || !jQuery(this).val()){
                    jQuery(myApplyButton).removeClass('hasChange');
                    jQuery(myCancel).addClass('confirm');
                    }
            });
            jQuery('.GNAV_ADMIN_META_NEW_TEXT').bind('input', function(){
                var myElement = jQuery(this).parent();
                var myValue = jQuery(myElement).attr('metaval');
                var myApplyButton = jQuery(myElement).children('button.GNAV_ADMIN_META_CHANGE_EXEC');
                var myChangeConfirm = jQuery(myElement).children('span.GNAV_ADMIN_META_SCHANGE_confirm');
                var myChangeCancel = jQuery(myElement).children('span.GNAV_ADMIN_META_SCHANGE_cancel');
                var myDeleteConfirm = jQuery(myElement).children('span.GNAV_ADMIN_META_rem_confirm ');
                var myDeleteCancel = jQuery(myElement).children('span.GNAV_ADMIN_META_rem_cancel ');
                var myDeleteButton = jQuery(myElement).children('img.GNAV_ADMIN_META_remVal');
                jQuery(myChangeConfirm).removeClass('confirm');
                jQuery(myChangeCancel).removeClass('confirm');
                jQuery(myDeleteConfirm).removeClass('confirm');
                jQuery(myDeleteCancel).removeClass('confirm');
                if(jQuery(this).val()!=myValue){
                    jQuery(myApplyButton).addClass('hasChange');
                    jQuery(myDeleteButton).addClass('invisible');
                    jQuery(myChangeCancel).addClass('confirm');
                    }
                else if(jQuery(this).val()==myValue){
                    jQuery(myApplyButton).removeClass('hasChange');
                    jQuery(myDeleteButton).removeClass('invisible');
                    jQuery(myChangeCancel).removeClass('confirm');
                    }
                else if(jQuery(this).val() =="" || !jQuery(this).val()){jQuery(myApplyButton).removeClass('hasChange');}
            });
            jQuery('.GNAV_ADMIN_META_CHANGE_EXEC').click(function(){
                var myElement = jQuery(this).parent();
                var myConfirm = jQuery(myElement).children('span.GNAV_ADMIN_META_SCHANGE_confirm');
                var myCancel = jQuery(myElement).children('span.GNAV_ADMIN_META_SCHANGE_cancel');
                var myDeleteConfirm = jQuery(myElement).children('span.GNAV_ADMIN_META_rem_confirm ');
                var myDeleteCancel = jQuery(myElement).children('span.GNAV_ADMIN_META_rem_cancel ');
                jQuery(myConfirm).addClass('confirm');
                jQuery(myCancel).addClass('confirm');
                jQuery(myDeleteConfirm).removeClass('confirm');
                jQuery(myDeleteCancel).removeClass('confirm');
            });
            jQuery('.GNAV_ADMIN_META_SCHANGE_cancel').click(function(){
                var myElement = jQuery(this).parent();
                var oValue = jQuery(myElement).attr('gnav_value');
                var myApplyButton = jQuery(myElement).children('.GNAV_ADMIN_META_CHANGE_EXEC');
                var myConfirm = jQuery(myElement).children('span.GNAV_ADMIN_META_SCHANGE_confirm');
                var myCancel = jQuery(myElement).children('span.GNAV_ADMIN_META_SCHANGE_cancel');
                var myText = jQuery(myElement).children('.GNAV_ADMIN_META_NEW_TEXT');
                var mySelectText = jQuery(myElement).children('select.GNAV_ADMIN_META_NEW_TEXT');
                var myDeleteButton = jQuery(myElement).children('img.GNAV_ADMIN_META_remVal');
                jQuery(myConfirm).removeClass('confirm');
                jQuery(myCancel).removeClass('confirm');
                jQuery(myApplyButton).removeClass('hasChange');
                jQuery(myDeleteButton).removeClass('invisible');
                if(jQuery(mySelectText).length==0){jQuery(myText).val(oValue);}
                else{
                    GNAV_admin.setSelectedMetaOption(mySelectText, oValue);
                }
            });
            jQuery('img.GNAV_ADMIN_META_remVal').click(function(){
                var myElement = jQuery(this).parent();
                var myConfirm = jQuery(myElement).children('span.GNAV_ADMIN_META_rem_confirm ');
                var myCancel = jQuery(myElement).children('span.GNAV_ADMIN_META_rem_cancel ');
                var myChangeConfirm = jQuery(myElement).children('span.GNAV_ADMIN_META_SCHANGE_confirm');
                var myChangeCancel = jQuery(myElement).children('span.GNAV_ADMIN_META_SCHANGE_cancel');
                jQuery(myConfirm).addClass('confirm');
                jQuery(myCancel).addClass('confirm');
                jQuery(myChangeConfirm).removeClass('confirm');
                jQuery(myChangeCancel).removeClass('confirm');
            });
            jQuery('.GNAV_ADMIN_META_rem_cancel').click(function(){
                var myElement = jQuery(this).parent();
                var myConfirm = jQuery(myElement).children('span.GNAV_ADMIN_META_rem_confirm ');
                var myCancel = jQuery(myElement).children('span.GNAV_ADMIN_META_rem_cancel ');
                jQuery(myConfirm).removeClass('confirm');
                jQuery(myCancel).removeClass('confirm');
            });
            jQuery('img.GNAV_ADMIN_META_addIC').click(function(){
                var myElement = jQuery(this).closest('li.GNAV_ADMIN_META_VALID_CNT');
                var myUL = jQuery(myElement).children('ul.GNAV_ADMIN_META_ITEM_LIST');
                // ** insert empty meta item **//
                var GNAV_VALUE_TYPE = jQuery(myElement).attr('gnav_value_type');
                var myMetaCat = jQuery(myElement).attr('gnav_value');
                GNAV_admin.insertEmptyMetaValue(myUL, GNAV_VALUE_TYPE, myMetaCat);
                GNAV_admin.setHover();
            });
            jQuery('.GNAV_ADMIN_ADDNEW_META_UNDO').click(function(){
                var myElement = jQuery(this).closest('li.GNAV_ADMIN_META_VALID_CNT');
                if(jQuery(myElement).hasClass('newMeta')){
                    jQuery(myElement).remove();
                }
            });
            // *** remove a value ***
            jQuery('.GNAV_ADMIN_META_rem_confirm').click(function(){
                var myElement = jQuery(this).closest('.GNAV_ADMIN_META_VALID_CNT');
                var mySid = jQuery(myElement).attr('sid');
                var cVersion = jQuery(myElement).attr('sversion');
                if(mySid!=GNAV_admin.currentSurvey || cVersion!=GNAV_admin.currentVersion){
                    alert('Ooops, the loaded data is out of sync, please reload before making changes');
                    return;
                }
                var oMCat = jQuery(myElement).attr('gnav_mcat');
                var oMVal = jQuery(myElement).attr('gnav_value');
                var oMType = jQuery(myElement).attr('gnav_value_type');
                // data like: [mySid, myVersion, [oMCat, oMVal, oMType],[nMCat,nMVal, nMType]];
                var sArray = [mySid,cVersion,[oMCat, oMVal, oMType],["-1","-1","-1"]];
                var q = d3_queue.queue()
                    .defer(GNAV_admin.sendSingleMetaChange, sArray)
                    .await(function(error, data){
                        if (error){alert(error);}
                        else{
                            GNAV_admin.reloadData();
                        }
                    });
            });
            // *** change a value ***
            jQuery('.GNAV_ADMIN_META_SCHANGE_confirm').click(function(){
                var myElement = jQuery(this).closest('.GNAV_ADMIN_META_VALID_CNT');
                var mySid = GNAV_admin.currentSurvey;
                var cVersion = GNAV_admin.currentVersion;
                var myTextElement = jQuery(myElement).children('.GNAV_ADMIN_META_NEW_TEXT');
                var mySelectElement = jQuery(myElement).children('select.GNAV_ADMIN_META_NEW_TEXT');
                var oMCAT, oMVal, oMType;
                var nMCAT, nMVal, nMType;
                // old values   
                if(jQuery(myElement).hasClass('newMeta')){
                    oMCat = "-1";
                    oMVal = "-1";
                    oMType = "-1";
                }
                else{
                    oMCat = jQuery(myElement).attr('gnav_mcat');
                    oMVal = jQuery(myElement).attr('gnav_value');
                    oMType = jQuery(myElement).attr('gnav_value_type');
                }
                // new values
                if (mySelectElement.length>0){
                    var myOpt = jQuery(mySelectElement).find(":selected");
                    nMVal = myOpt.attr('gnav_value');
                    nMType = myElement.attr('gnav_value_type');
                }
                else{
                    nMVal = myTextElement.val();
                    nMType = jQuery(myElement).attr('gnav_value_type');
                    //if(GNAV_admin.isURL(nMVal)){nMType = "URL";}
                }
                // general
                nMCAT = jQuery(myElement).attr('gnav_mcat');
                // data like: [mySid, myVersion, [oMCat, oMVal, oMType],[nMCat,nMVal, nMType]];
                var sArray= [mySid,cVersion,[oMCat,oMVal,oMType],[nMCAT,nMVal,nMType]];
                var q = d3_queue.queue()
                    .defer(GNAV_admin.sendSingleMetaChange, sArray)
                    .await(function(error, data){
                        if (error){alert(error);}
                        else{
                            GNAV_admin.reloadData();
                        }
                    });
            });
            // *** new metacats ***
            jQuery('#GNAV_ADMIN_SEARCH_META_INPUT').on('input', function(e){
                jQuery('#GNAV_ADMIN_SEARCH_META_R').empty();
                var metaCats;
                var sTerm = jQuery(this).val();
                if (sTerm.length>3){
                    metaCats = GNAV_admin.findMetaItems(sTerm);
                }
            });
            // *** create new survey Dataset
            jQuery('button.GNAV_ADMIN_SURVEY_SELECTOR_ADD_VERSION').click(function(){
                var Q =d3_queue.queue()
                    .defer(GNAV_admin.addSurveyDataset, GNAV_admin.currentSurvey)
                    .await(function(error, data){
                        if(error){throw error;}
                        GNAV_admin.reloadPage();
                    });
                
            });
            jQuery('button.GNAV_ADMIN_SET_PENDING').click(function(){
                var cSurvey = GNAV_admin.currentSurvey;
                var cVersion = GNAV_admin.currentVersion;
                var cDS = GNAV_admin.getSurvey(cSurvey,cVersion);
                if(cDS==-1){
                    alert ("Ooops, something went wrong");
                    return;
                }
            });
            jQuery('button.GNAV_ADMIN_MANAGE_SURVEYSTATUS').click(function(){
                var mySurvey = GNAV_admin.currentSurvey;
                var myVersion = GNAV_admin.currentVersion;
                GNAV_admin.openManageSurveyStatus(mySurvey, myVersion);
            });
            GNAV_admin.setHover();
            GNAV_admin.setCollapse();
            GNAV_admin.setRights();
            var t1 = performance.now();
            console.log('setAct: '+ (t1 - t0) + " milliseconds.");
            GNAV_admin.setPopover();
        }
    },
    openManageSurveyStatus: function(SID, SVERSION){
        jQuery('.overlay').addClass('hideContent');
        var sVersions = GNAV_admin.getVersions(SID);
        var t, tClone, tContent;
        var versionUL;
        var i, iM=sVersions.length;
        t=document.querySelector('template.GNAV_ADMIN_MANAGE_STATUS');
        tClone = t.cloneNode(true, true);
        tContent = tClone.content;
        versionUL= jQuery(tContent).find('.GNAV_ADMIN_MANAGE_STATUS_SUM_VSUL');
        var tV, tVClone, tVContent;

        var container = jQuery(tContent).children('.GNAV_ADMIN_MANAGE_STATUS_CNT');
        var currentSV_STAT = jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_SVH");  
        var currentSV_STAT_TEXT=jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_SVHV");
        var currentSV_btn_publish=jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_SV_publish");
        var currentSV_btn_no_publish=jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_SV_no_publish");

        var currentVS_STAT = jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_VSH");
        var currentVS_VS = jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_VSHVS");
        var currentVS_STAT_TEXT=jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_VSHV");
        var currentVS_btn_pending=jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_VS_setPending");
        var currentVS_btn_publish=jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_VS_publish");
        var currentVS_btn_reject=jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_VS_reject");
        var addVSButton = jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_ADDVS");
        
        var currentSV_N =jQuery(tContent).find(".GNAV_ADMIN_MANAGE_STATUS_SVN");
                         
        var key; 
        var maxVersion;

        var tV_version, tV_status;
        tV=document.querySelector('template.GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI_TPL');
        
        for(i=0;i<iM;i+=1){
            tVClone = tV.cloneNode(true, true);
            tVContent = tVClone.content;
            
            tV_ListItem=jQuery(tVContent).children('.GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI');
            tV_version=jQuery(tVContent).find('.GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI_VS');
            tV_status=jQuery(tVContent).find('.GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI_VSSTAT');

            jQuery(tV_ListItem).addClass(sVersions[i].version_status);
            jQuery(tV_version).text(sVersions[i].SVERSION);
            jQuery(tV_status).text(sVersions[i].version_status);
            
            
            for (key in sVersions[i]){
                if(sVersions[i].hasOwnProperty(key)){
                    jQuery(tV_ListItem).attr(key,sVersions[i][key]);
                }
            }
            if(sVersions[i].SVERSION==SVERSION){
                jQuery(currentSV_STAT).addClass(sVersions[i].SURVEY_STATUS);
                jQuery(currentSV_STAT_TEXT).text(sVersions[i].SURVEY_STATUS);
                jQuery(currentSV_N).text(sVersions[i].surveyName);
                jQuery(currentVS_VS).text(sVersions[i].SVERSION);
                for (key in sVersions[i]){
                    if(sVersions[i].hasOwnProperty(key)){
                        jQuery(container).attr(key,sVersions[i][key]);
                    }
                }
                /*  SURVEY STATUS */
                if(sVersions[i].SURVEY_STATUS=="publish"){
                    jQuery(currentSV_btn_publish).addClass('disabled');
                    jQuery(currentSV_btn_no_publish).removeClass('disabled');
                }
                if(sVersions[i].SURVEY_STATUS=="hidden"){
                    jQuery(currentSV_btn_publish).removeClass('disabled');
                    jQuery(currentSV_btn_no_publish).addClass('disabled');
                }
                if(sVersions[i].SURVEY_STATUS=="new"){
                    jQuery(currentSV_btn_publish).removeClass('disabled');
                    jQuery(currentSV_btn_no_publish).removeClass('disabled');
                }
                /*  version_status */
                if(sVersions[i].version_status=="new" || sVersions[i].version_status=="in_process"){
                    jQuery(currentVS_btn_pending).removeClass('disabled');
                    jQuery(currentVS_btn_publish).removeClass('disabled');
                    jQuery(currentVS_btn_reject).removeClass('disabled');
                }
                if(sVersions[i].version_status=="pending_approval"){
                    jQuery(currentVS_btn_pending).addClass('disabled');
                    jQuery(currentVS_btn_publish).removeClass('disabled');
                    jQuery(currentVS_btn_reject).removeClass('disabled');
                }
                if(sVersions[i].version_status=="publish"){
                    jQuery(currentVS_btn_pending).addClass('disabled');
                    jQuery(currentVS_btn_publish).addClass('disabled');
                    jQuery(currentVS_btn_reject).removeClass('disabled');
                }
                
                
                jQuery(currentVS_STAT).addClass(sVersions[i].version_status);
                jQuery(currentVS_STAT_TEXT).text(sVersions[i].version_status);
            }
            if(sVersions[i].maxVersion==sVersions[i].SVERSION){
                if(sVersions[i].version_status!="publish"){
                    jQuery(addVSButton).addClass('disabled');
                }
            }
            
            
            var CUR=GNAV_admin_local.current_user_rights;
            if(!CUR.hasOwnProperty('gnav_allow_accept_reject') || CUR.gnav_allow_accept_reject==false){
                jQuery(currentVS_btn_publish).addClass('disabled');
                jQuery(currentVS_btn_reject).addClass('disabled');
                jQuery(currentSV_btn_publish).addClass('disabled');
                jQuery(currentSV_btn_no_publish).addClass('disabled');
            }
            jQuery(versionUL).append(tVContent);
        }
        jQuery('body').prepend(tContent);
        GNAV_admin.setAct_manage();
    },    
    setAct_manage: function(){
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_SV_publish').off('click');
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_CLOSE').off('click');
        jQuery(".GNAV_ADMIN_MANAGE_STATUS_SV_no_publish").off('click');
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI').off('click');
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_setPending').off('click');
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm_N').off('click');
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm_Y').off('click');
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_reject').off('click');
        
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_SV_publish').click(function(){
            // set the SURVEY to publish
            var myContainer = jQuery(this).parents('.GNAV_ADMIN_MANAGE_STATUS_CNT');
            var mySID = jQuery(myContainer).attr('sid');
            var myVersion =jQuery(myContainer).attr('sversion');
            if(!mySID || mySID!=GNAV_admin.currentSurvey){alert("Ooops, something went awfully wrong"); return;}
            var Q = d3_queue.queue()
                .defer(GNAV_admin.publishSurvey, mySID)
                .await(function(error, data){
                    if(error){alert("Ooops, something went awfully wrong"); return;}
                    jQuery('.GNAV_ADMIN_MANAGE_STATUS_CLOSE').trigger('click');
                    GNAV_admin.reloadPage(mySID,myVersion);
                });
        });
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_CLOSE').click(function(){
            var myContainer = jQuery(this).parents('.GNAV_ADMIN_MANAGE_STATUS_CNT');
            jQuery(myContainer).remove();
            jQuery('.overlay').removeClass('hideContent');
        });
        jQuery(".GNAV_ADMIN_MANAGE_STATUS_SV_no_publish").click(function(){
            var myContainer = jQuery(this).parents('.GNAV_ADMIN_MANAGE_STATUS_CNT');
            var mySID = jQuery(myContainer).attr('sid');
            var myVersion =jQuery(myContainer).attr('sversion');
            if(!mySID || mySID!=GNAV_admin.currentSurvey){alert("Ooops, something went awfully wrong"); return;}
            var Q = d3_queue.queue()
                .defer(GNAV_admin.hideSurvey, mySID)
                .await(function(error, data){
                    if(error){alert("Ooops, something went awfully wrong"); return;}
                    jQuery('.GNAV_ADMIN_MANAGE_STATUS_CLOSE').trigger('click');
                    GNAV_admin.reloadPage(mySID, myVersion);
                });
        });
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI').click(function(){
            var SID=jQuery(this).attr('sid');
            var SVERSION=jQuery(this).attr('sversion');
            var myContainer = jQuery(this).parents('.GNAV_ADMIN_MANAGE_STATUS_CNT');
            var CSID=jQuery(myContainer).attr('sid');
            var CSVERSION=jQuery(myContainer).attr('sversion');
            if(CSVERSION!=SVERSION){
                jQuery(myContainer).remove();
                GNAV_admin.openManageSurveyStatus(SID, SVERSION);
            }
        });
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_ADDVS').click(function(){
            // only if max version is publish
            var myContainer = jQuery(this).parents('.GNAV_ADMIN_MANAGE_STATUS_CNT');
            var mySID = jQuery(myContainer).attr('sid');
            var maxVersion=jQuery(myContainer).attr('maxversion');
            var mySurvey = GNAV_admin.getSurvey(mySID,maxVersion);
            if(mySurvey.hasOwnProperty('version_status') && mySurvey.version_status=="publish"){
                var d=d3_queue.queue()
                    .defer(GNAV_admin.addSurveyDataset, mySID)
                    .await(function(error, data){
                        if(error){
                            alert('Sorry, failed to add a new dataset to the survey\n\n' + error);
                            return;
                        }
                        jQuery('.GNAV_ADMIN_MANAGE_STATUS_CLOSE').trigger('click');
                        GNAV_admin.reloadPage(mySID,data);
                        //GNAV_admin.selectSurvey(mySID,data);
                    });
            }
        });
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_setPending').click(function(){
            var CC=jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm');
            jQuery(CC).attr('gnav_action','vs_set_pending');
            jQuery(CC).removeClass('disabled');
        });
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_publish').click(function(){
            var CC=jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm');
            jQuery(CC).attr('gnav_action','vs_set_accept');
            jQuery(CC).removeClass('disabled');
        });
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_reject').click(function(){
            var CC=jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm');
            jQuery(CC).attr('gnav_action','vs_reject');
            jQuery(CC).removeClass('disabled');
        });
        
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm_N').click(function(){
            var CC=jQuery(this).parent('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm');
            jQuery(CC).removeAttr('gnav_action');
            jQuery(CC).addClass('disabled');
        });
        jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm_Y').click(function(){
            var CC=jQuery(this).parent('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm');
            var action=jQuery(CC).attr('gnav_action');
            if(!action){
                alert("Ooops, something went wrong, cannot find out what to confirm.. sorry");
                jQuery('.GNAV_ADMIN_MANAGE_STATUS_VS_confirm_N').trigger('click');
                return;
            }
            var myContainer = jQuery(this).parents('.GNAV_ADMIN_MANAGE_STATUS_CNT');
            var mySID = jQuery(myContainer).attr('sid');
            var myVersion =jQuery(myContainer).attr('sversion');
            var nsvstat;
            var q;
            if(action=="vs_set_pending"){nsvstat="pending_approval";}
            if(action=="vs_set_accept"){nsvstat="publish";}
            if(action=="vs_reject"){
                jQuery(CC).attr('gnav_action',"vs_reject_twice");
                jQuery(this).text('confirm remove dataset');
                GNAV_admin.blink(CC);
            }
            if(action=="vs_reject_twice"){
                q=d3_queue.queue()
                    .defer(GNAV_admin.rejectVersion, mySID, myVersion)
                    .await(function(error, data){
                        jQuery('.GNAV_ADMIN_MANAGE_STATUS_CLOSE').trigger('click');
                        GNAV_admin.reloadPage();
                    });
            }
            if(action=="vs_set_pending" || action=="vs_set_accept"){
                q=d3_queue.queue()
                    .defer(GNAV_admin.changeVersionStatus, mySID, myVersion, nsvstat)
                    .await(function(error, data){
                        jQuery('.GNAV_ADMIN_MANAGE_STATUS_CLOSE').trigger('click');
                        GNAV_admin.reloadPage(mySID,myVersion);
                    });
            }
            
        });
    
    }, 
    setHover: function(){
        jQuery('img.GNAV_ADMIN_addIC').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');}); // add an item to the list
        jQuery('span.GNAV_ADMIN_ADDNEW_UNDO').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        jQuery('span.GNAV_ADMIN_ADDNEW_SCORE_SPECIAL_UNDO').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        jQuery('img.GNAV_ADMIN_remVal').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        jQuery('span.GNAV_ADMIN_rem_confirm').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        jQuery('span.GNAV_ADMIN_rem_cancel').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        jQuery('span.GNAV_ADMIN_SCHANGE_confirm').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        jQuery('span.GNAV_ADMIN_SCHANGE_cancel').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        jQuery('span.GNAV_ADMIN_CONFREJ').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        jQuery('img.GNAV_ADMIN_META_addIC').hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        jQuery('img.GNAV_ADMIN_META_remVal').hover(function(){
            jQuery(this).addClass('hover');
            var myParent = jQuery(this).closest('.GNAV_ADMIN_META_VALID_CNT');
            jQuery(myParent).children('.GNAV_ADMIN_META_NEW_TEXT').addClass('remove_hover');
            },
            function(){
                jQuery(this).removeClass('hover');
                var myParent = jQuery(this).closest('.GNAV_ADMIN_META_VALID_CNT');
                jQuery(myParent).children('.GNAV_ADMIN_META_NEW_TEXT').removeClass('remove_hover');
                });
    },
    setPopover: function(){
        GNAV_admin.popoverOptions.title = 'Add';
        GNAV_admin.popoverOptions.content = "add a scoreValue.";
        jQuery('img.GNAV_ADMIN_addIC').popover(GNAV_admin.popoverOptions);
        GNAV_admin.popoverOptions.content = "add a metaValue.";
        jQuery('img.GNAV_ADMIN_META_addIC').popover(GNAV_admin.popoverOptions);
        GNAV_admin.popoverOptions.title = 'Remove';
        GNAV_admin.popoverOptions.content = "Remove this scoreValue.";
        jQuery('img.GNAV_ADMIN_remVal').popover(GNAV_admin.popoverOptions);
        GNAV_admin.popoverOptions.content = "Remove this metaValue.";
        jQuery('img.GNAV_ADMIN_META_remVal').popover(GNAV_admin.popoverOptions);
        GNAV_admin.popoverOptions.title = "survey status";
        GNAV_admin.popoverOptions.content = "new: survey is entered, but not reviewed.<br/>in_process: survey is being reviewed.<br/>publish: survey has passed review<br/>not_accepted: survey is rejected";
        jQuery('.GNAV_ADMIN_SURVEY_STATUS').popover(GNAV_admin.popoverOptions);
    },
    setCollapse: function(){
        jQuery('.GNAV_ADMIN_HIDE_FILTER_BTN').addClass('show');
        /*** set the items that can be collapsed ***/
        jQuery('#GNAV_ADMIN_SVAL_UL').collapse();
        jQuery('#GNAV_ADMIN_META_UL').collapse();
        jQuery('.GNAV_ADMIN_VS_STATUS_FRM').collapse();
        jQuery('.GNAV_ADMIN_SV_STATUS_FRM').collapse();
        
        
        /*** set the controlling items ***/
        jQuery('#GNAV_ADMIN_SCORE_HEADER').click(function(){jQuery('#GNAV_ADMIN_SVAL_UL').collapse('toggle');});
        jQuery('#GNAV_ADMIN_META_HEADER').click(function(){jQuery('#GNAV_ADMIN_META_UL').collapse('toggle');});
        jQuery('.GNAV_ADMIN_HIDE_FILTER_BTN').click(function(){
            jQuery('.GNAV_ADMIN_VS_STATUS_FRM').add('.GNAV_ADMIN_SV_STATUS_FRM').collapse('toggle');
        });

        jQuery('#GNAV_ADMIN_META_HEADER').hover(
            function(){jQuery('#GNAV_ADMIN_META_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').removeClass('hidden');},
            function(){jQuery('#GNAV_ADMIN_META_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').addClass('hidden');}
            );
        jQuery('#GNAV_ADMIN_SCORE_HEADER').hover(
            function(){jQuery('#GNAV_ADMIN_SCORE_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').removeClass('hidden');},
            function(){jQuery('#GNAV_ADMIN_SCORE_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').addClass('hidden');}
            );
        /*** on act ***/
        jQuery('#GNAV_ADMIN_META_UL').on('shown.bs.collapse',function(){
            jQuery('#GNAV_ADMIN_META_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').addClass('hidden');
            jQuery('#GNAV_ADMIN_META_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').text('click to hide values');
            });
        jQuery('#GNAV_ADMIN_META_UL').on('hidden.bs.collapse',function(){
            jQuery('#GNAV_ADMIN_META_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').removeClass('hidden');
            jQuery('#GNAV_ADMIN_META_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').text('click to show values');
            });    
        jQuery('#GNAV_ADMIN_SVAL_UL').on('shown.bs.collapse',function(){
            jQuery('#GNAV_ADMIN_SCORE_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').addClass('hidden');
            jQuery('#GNAV_ADMIN_SCORE_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').text('click to hide values');
            
            });
        jQuery('#GNAV_ADMIN_SVAL_UL').on('hidden.bs.collapse',function(){
            jQuery('#GNAV_ADMIN_SCORE_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').removeClass('hidden');
            jQuery('#GNAV_ADMIN_SCORE_HEADER').children('.GNAV_ADMIN_CLICK_EXPAND').text('click to show values');
            });   
    },    
    setRights: function(){
        var currentDataset = GNAV_admin.getSurvey(GNAV_admin.currentSurvey, GNAV_admin.currentVersion);
        var currentUser = GNAV_admin_local.current_user_id;
        var user_rights = GNAV_admin_local.current_user_rights;
                
        /* default: disable all: */
        jQuery('.UR_DEPENDENT').removeClass('enabled');
        jQuery('select.UR_DEPENDENT').attr('disabled','disabled');
        jQuery('.GNAV_ADMIN_META_NEW_TEXT').prop('disabled','disabled');
        jQuery('textArea.GNAV_ADMIN_META_NEW_TEXT').attr('readonly','readonly');

        if(currentDataset==-1){ return;} // no need to do anything, as nothing is selected.
        /* own survey in status new, in_process */
        var sNes = ['new','in_process'];
        if(sNes.indexOf(currentDataset.version_status)>-1){
            jQuery('img.GNAV_ADMIN_addIC').addClass('enabled'); // add values
            jQuery('img.GNAV_ADMIN_META_addIC').addClass('enabled'); // add values
            jQuery('.GNAV_ADMIN_remVal').addClass('enabled'); // remove a value
            jQuery('img.GNAV_ADMIN_META_remVal').addClass('enabled'); // remove a value
            
            jQuery('.GNAV_ADMIN_CHANGE_SCORE_EXEC').addClass('enabled'); // execute change
            jQuery('.GNAV_ADMIN_META_CHANGE_EXEC').addClass('enabled'); // execute change
            
            jQuery('input.GNAV_ADMIN_META_NEW_TEXT').addClass('enabled'); // change data
            jQuery('textArea.GNAV_ADMIN_META_NEW_TEXT').addClass('enabled'); // change data
            jQuery('.GNAV_ADMIN_META_NEW_TEXT').prop('disabled',false); // change data
            jQuery('textArea.GNAV_ADMIN_META_NEW_TEXT').removeAttr('readonly');
            jQuery('select.UR_DEPENDENT').removeAttr('disabled'); // change data

        }
    },
    /******************************/
    /*******  LOOKUP STUFF ********/
    /******************************/
    isMetaElement: function(scoreElement){
        if(scoreElement.hasOwnProperty('GNAV_MCAT') && scoreElement.GNAV_MCAT){return true;}
        return false;
    },
    isURL: function(s){
        var myRegex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
        return !!s.match(myRegex);
    },
    getRootCatID: function(){
        var res=GNAV_admin.getCatBy("GNAV_DESCRIPTION", "root");
        if(res && res[0].hasOwnProperty('GNAV_SCAT')){
            return res[0].GNAV_SCAT;
        }
        return false;
    },
    getCatBy: function (k, val){
        var i, iM = GNAV_admin.scoreCatDefs.length;
        var res = [];
        for (i=0; i<iM; i+=1){
            if (GNAV_admin.scoreCatDefs[i].hasOwnProperty(k) && GNAV_admin.scoreCatDefs[i][k]==val){
                res.push(GNAV_admin.scoreCatDefs[i]);
            }
        }
        return res;
    },
    getCatChildren: function(catID){
        var res=GNAV_admin.getCatBy("SCORE_PARENT", catID);
        return res.sort(GNAV_admin.sortByCatOrder);

    },
    getOrigValues: function(catID){
        var i, iM = GNAV_admin.currentScores.length;
        var res = [];
        for (i=0; i<iM; i+=1){
            if (GNAV_admin.currentScores[i].hasOwnProperty('GNAV_SCAT') && GNAV_admin.currentScores[i].GNAV_SCAT == catID){
                res.push(GNAV_admin.currentScores[i]);
            }
        }
        return res;
    },
    getCatDef: function(catID){
        var res=GNAV_admin.getCatBy("GNAV_SCAT", catID);
        if (res && res.length==1){
            return res[0];
        }
        return false;
    },
    getDataCatDef: function(GNAV_DCAT){
        var i, iM=GNAV_admin.dataCatDefs.length;
        for (i=0; i<iM; i+=1){
            if(GNAV_admin.dataCatDefs[i].GNAV_VALUE==GNAV_DCAT){
                return GNAV_admin.dataCatDefs[i];
            }
        }
        return false;
    },
    getCatOrder: function(catID){
        var i, iM = GNAV_admin.scoreCatO.length;
        for ( i = 0; i < iM; i += 1 ){
            if (GNAV_admin.scoreCatO[i].hasOwnProperty('GNAV_SCAT') && GNAV_admin.scoreCatO[i].GNAV_SCAT == catID){
                if(GNAV_admin.scoreCatO[i].hasOwnProperty('GNAV_SORDER')){
                    return GNAV_admin.scoreCatO[i].GNAV_SORDER;}
                else {return iM;}
            }
        }
        return iM + 1;
    },
    isMeta: function(catID){
        var res=GNAV_admin.getCatBy("GNAV_SCAT", catID);
        if(res && res.length==1){
            if (res[0].hasOwnProperty('GNAV_MCAT') && res[0].GNAV_MCAT !="null"){
                return true;
            }
        }
        return false;
        /*
        
        
        var i, iM= GNAV_admin.allMeta.length;
        for (i=0; i<iM; i+=1){
            if(GNAV_admin.allMeta[i].hasOwnProperty('GNAV_SCAT') && GNAV_admin.allMeta[i].GNAV_SCAT==catID){
                return true;
            }
        }
        return false;
        */
    },
    getSurvey: function(surveyID, sVersion){
        var i, iM = GNAV_admin.allSurveys.length;
        for ( i = 0; i < iM; i += 1 ){
            if(GNAV_admin.allSurveys[i].hasOwnProperty('SID') && GNAV_admin.allSurveys[i].SID == surveyID){
                if(GNAV_admin.allSurveys[i].hasOwnProperty('SVERSION') && GNAV_admin.allSurveys[i].SVERSION == sVersion){
                    return GNAV_admin.allSurveys[i];
                }
            }
        }
        return -1;
    },
    countNewVal: function(catID){
        var NV = jQuery('li.GNAV_ADMIN_SCORE_VALID_CNT[scat="'+catID+'"][sval=""]');
        var NSV = jQuery('li.GNAV_ADMIN_SCORE_SPECIAL_VALID_CNT[scat="'+catID+'"][sval=""]');
        var res = NV.length + NSV.length;
        return res;
    },
    getDataType: function(sCat){
        var catDef =GNAV_admin.getCatDef(sCat);
        if(catDef && catDef.hasOwnProperty("GNAV_VALUE_TYPE")){
            return catDef.GNAV_VALUE_TYPE;
        }
        return "GNAV_SVAL";
    },
    scoreExists: function(SCat, DCat, SVal){
        var i, iM = GNAV_admin.currentScores.length;
        for ( i = 0; i < iM; i += 1) {
            if(GNAV_admin.currentScores[i].hasOwnProperty('SCat') && GNAV_admin.currentScores[i].SCat == SCat){
                if(GNAV_admin.currentScores[i].hasOwnProperty('SVal') && GNAV_admin.currentScores[i].SVal == SVal){
                        if(GNAV_admin.currentScores[i].hasOwnProperty('DCat') && GNAV_admin.currentScores[i].DCat == DCat){return true;}
                }
            }
        }
        return false;
    },
    getMetaDef: function(metaCat){
        // GNAV_VALUE, GNAV_VALUE_TYPE, GNAV_DESCRIPTION
        var i, iM = GNAV_admin.allMeta.length;
        for (i=0;i<iM; i+=1){
            if (GNAV_admin.allMeta[i].hasOwnProperty('GNAV_VALUE') && GNAV_admin.allMeta[i].GNAV_VALUE==metaCat){
                return GNAV_admin.allMeta[i];
            }
        }
        console.log('getMetaDef: ' + metaCat + " failed");
        return false;
    },
    getMyMetaItems: function(metaCat){
        var i, iM = GNAV_admin.currentMeta.length;
        var res = [];
        var cMetaCat;
        for ( i = 0; i < iM; i += 1){
            cMetaCat = GNAV_admin.currentMeta[i].GNAV_MCAT;
            if(cMetaCat == metaCat){
                res.push(GNAV_admin.currentMeta[i]);
            }
        }
        return res;
    },
    findMetaItems: function(inString){
        //GNAV_VALUE: "author", GNAV_VALUE_TYPE: "MetaCategory", GNAV_DESCRIPTION: "Author"
        var res = [];
        var mString;
        var i, iM =GNAV_admin.allMeta.length;
        for (i=0; i<iM; i+=1){
            var cMetaItem = GNAV_admin.allMeta[i];
            if(cMetaItem.hasOwnProperty('GNAV_VALUE')){
                mString=cMetaItem.GNAV_VALUE;
                if(inString.length<=mString.length){
                    if(mString.indexOf(inString)>-1){
                        if(!GNAV_admin.objectInObjectArray(cMetaItem,res)){
                            res.push(cMetaItem);
                        }
                    }
                }
            }
            if(cMetaItem.hasOwnProperty('GNAV_DESCRIPTION')){
                mString=cMetaItem.GNAV_DESCRIPTION;
                if(inString.length<=mString.length){
                    if(mString.indexOf(inString)>-1){
                        if(!GNAV_admin.objectInObjectArray(cMetaItem,res)){
                            res.push(cMetaItem);
                        }
                    }
                }
            }
        }
        return res;
    },
    getVersions: function(SID){
        var i, iM = GNAV_admin.allSurveys.length;
        var res = [];
        for (i=0; i<iM; i+=1){
            if(GNAV_admin.allSurveys[i].hasOwnProperty('SID') && GNAV_admin.allSurveys[i].SID==SID){
                    res.push(GNAV_admin.allSurveys[i]);
            }
        }
        return res.sort(GNAV_admin.sortByVersion);
    },
    /****************************/
    /*******  SHOW RESULT *******/
    /****************************/
    blink: function(element){
        var i;
        for(i=0;i<3;i++) {
            jQuery(element).fadeTo('slow', 0.5).fadeTo('slow', 1.0);
        }
    },
    
    
    showUploadResult: function(result_list){
        if(result_list.length>0){
            var t = document.querySelector("template.GNAV_ADMIN_DU_RES");
            var tClone = t.cloneNode(true, true);
            var tContent = tClone.content;
            var tUL = tContent.querySelector('ul');
            jQuery(tContent).children().addBack('div#GNAV_ADMIN_DU_REST').attr('id','GNAV_ADMIN_DU_RESTS');
            var l = document.querySelector("template.GNAV_ADMIN_DU_RES_LI");
            var lClone = l.cloneNode(true, true);
            var lContent = lClone.content;
            var lTm, lTx;
            
            var i, iM = result_list.length;
            var ts, txt;
            var date, hrs,mns,secs;
            for(i=0;i<iM;i+=1){
                date = new Date(result_list[i][0]*1000);
                hrs = date.getHours();
                mins = date.getMinutes();
                secs = date.getSeconds();
                lClone = l.cloneNode(true, true);
                lContent = lClone.content;
                lTm = lContent.querySelector('.GNAV_ADMIN_DU_RES_TS');
                lTx = lContent.querySelector('.GNAV_ADMIN_DU_RES_TXT');
                jQuery(lTm).text(hrs + ':' + mins + ':' + secs);
                jQuery(lTx).text(result_list[i][1]);
                jQuery(tUL).prepend(lContent);
            }
            jQuery('body').prepend(tContent);
            jQuery('div#GNAV_ADMIN_DU_RESTS').click(function(){
                jQuery(this).remove();
            });
        }
    },
    /****************************/
    /*******  SORT STUFF ********/
    /****************************/
    SortByDCatValue: function(a,b){
        var aDCAT, bDCAT;
        if(a.hasOwnProperty('GNAV_VALUE_TYPE') && b.hasOwnProperty('GNAV_VALUE_TYPE')){
            aDCAT=GNAV_admin.getDataCatDef(a.GNAV_VALUE_TYPE);
            bDCAT=GNAV_admin.getDataCatDef(b.GNAV_VALUE_TYPE);
            if(aDCAT && bDCAT){
                if(aDCAT.GNAV_SORDER!=bDCAT.GNAV_SORDER){
                    return aDCAT.GNAV_SORDER-bDCAT.GNAV_SORDER;
                }
            }
        }
        if(a.hasOwnProperty('GNAV_VALUE') && b.hasOwnProperty('GNAV_VALUE')){
            return GNAV_admin.sortByString(a.GNAV_VALUE, b.GNAV_VALUE);
        }
        return 0;
    },
    sortBySORDER: function(a, b){
        if(a.hasOwnProperty('GNAV_SORDER') && b.hasOwnProperty('GNAV_SORDER') && a.GNAV_SORDER && b.GNAV_SORDER){
            if (a.GNAV_SORDER!=b.GNAV_SORDER){
                return a.GNAV_SORDER-b.GNAV_SORDER;
            }
        }
        if(a.hasOwnProperty('GNAV_DESCRIPTION') && b.hasOwnProperty('GNAV_DESCRIPTION') && a.GNAV_DESCRIPTION && b.GNAV_DESCRIPTION){
            return GNAV_admin.sortByString(a.GNAV_DESCRIPTION, b.GNAV_DESCRIPTION);
        }
        if(a.hasOwnProperty('GNAV_VALUE') && b.hasOwnProperty('GNAV_VALUE') && a.GNAV_VALUE && b.GNAV_VALUE){
            if(typeof a.GNAV_VALUE=='String' && typeof b=='String'){
                return GNAV_admin.sortByString(a.GNAV_VALUE, b.GNAV_VALUE);
            }
            else if(typeof a.GNAV_VALUE=='number' && typeof b=='number'){
                return a-b;
            }
        }
        return 0;
    },
    sortByCatOrder: function(a, b){
        if(a.hasOwnProperty('GNAV_SORDER') && b.hasOwnProperty('GNAV_SORDER')){
            if(a.GNAV_SORDER!=b.GNAV_SORDER){
                return a.GNAV_SORDER-b.GNAV_SORDER;
            }
        }
        else if(a.hasOwnProperty('GNAV_DESCRIPTION') && b.hasOwnProperty('GNAV_DESCRIPTION')){
            return GNAV_admin.sortByString(a.GNAV_DESCRIPTION, b.GNAV_DESCRIPTION);
        }
        else{
            return 0;
        }
    },
    sortByVersion: function(a,b){
        if(a.hasOwnProperty('SVERSION') && b.hasOwnProperty('SVERSION')){
            return a.SVERSION-b.SVERSION;
        }
        return 0;
    },
    sortByNum : function (a, b) {
        return a - b;
    },
    sortByString : function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    },
    /****************************/
    /*******  DATA STUFF ********/
    /****************************/
    objectsEqual: function(a,b){
        var k;
        var kCount=0;
        var isCount=0; 
        for (k in a){
            if(a.hasOwnProperty(k)){
                kCount+=1;
                if(b.hasOwnProperty(k) && a[k]==b[k]){isCount+=1;}
            }
        }
        if (isCount == kCount){
            return true;
        }
        return false;
    },
    objectInObjectArray:function(sObject,objectArray){
        var i, iM = objectArray.length;
        for (i=0;i<iM;i+=1){
            if(GNAV_admin.objectsEqual(sObject,objectArray[i])){
                return true;
            }
        }
        return false;
    },
    /****************************/
    /*******  AJAX STUFF ********/
    /****************************/
    addSurveyDataset: function(SID, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url,{
            action : 'gnav_proc',
            'GNAV_admin_AddVersion' : SID,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("addSurveyDataset", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    sendSingleChange: function(changeData, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_SC' : 1,
            'security' : GNAV_admin_local.ajax_nonce,
            'changeData': JSON.stringify(changeData)
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("sendSingleChange", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    sendSingleMetaChange: function(changeData, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_SMC' : 1,
            'security' : GNAV_admin_local.ajax_nonce,
            'changeData': JSON.stringify(changeData)
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("sendSingleMetaChange", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    getSurveys: function(selType, callback){
        //selType = ["all","own","open", "pending_approval"]
        //SV.SID, SV.SURVEY_STATUS, SV.create_user as SV_CREATE_USER, VS.SVERSION, VS.create_user as VS_CREATE_USER, VS.version_status, MV.maxVersion, SVN.GNAV_VALUE as surveyName
        var res = [];
        var i, iM;
        var openStat = ["new","in_process"];
        iM = GNAV_admin.allSurveys.length;
        switch(selType){
            case "all":
                res=GNAV_admin.allSurveys;
                break;
            case "own":
                for (i=0; i<iM; i+=1){
                    if(GNAV_admin.allSurveys[i].hasOwnProperty('VS_CREATE_USER') && GNAV_admin.allSurveys[i].VS_CREATE_USER == GNAV_admin_local.current_user_id){
                        res.push(GNAV_admin.allSurveys[i]);
                    }
                }
                break;
            case "open":
                for (i=0; i<iM; i+=1){
                    if(GNAV_admin.allSurveys[i].hasOwnProperty('status') && openStat.indexOf(GNAV_admin.allSurveys[i].status)!=-1){
                        res.push(GNAV_admin.allSurveys[i]);
                    }
                }
                break;
            case "pending":
                for (i=0; i<iM; i+=1){
                    if(GNAV_admin.allSurveys[i].hasOwnProperty('status') && GNAV_admin.allSurveys[i].status=='pending_approval'){
                        res.push(GNAV_admin.allSurveys[i]);
                    }
                }
                break;
        }
        callback (null, res);
    },
    getAllSurveys : function (callback) {
		GNAV_MAIN.showStatusMessage("getting all the surveys");
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_allSurvey' : 1,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
			GNAV_MAIN.showStatusMessage("got all the surveys");
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("getAllSurveys", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    getAllValues: function(surveyID, sV, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_allSurveyValues' : surveyID,
            'GNAV_admin_sVersion': sV,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("getAllValues", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    getAllDefs: function(callback){
		GNAV_MAIN.showStatusMessage("getting all the definitions");
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_allDefs' : 1,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
			GNAV_MAIN.showStatusMessage("got all the definitions");
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
			GNAV_MAIN.showStatusMessage("getting definitions failed...");
            GNAV_admin.failRequest("getAllDefs", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    getScoreDefs: function(callback) {
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_getScoreDefs' : 1,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("getScoreDefs", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    getScoreCatDefs: function(callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_getScoreHA' : 1,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("getScoreCatDefs", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    publishSurvey: function(SID, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_publish_survey' : SID,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("publishSurvey", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    hideSurvey: function(SID, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_hide_survey' : SID,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("hideSurvey", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    rejectVersion: function(SID, SVERSION, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_reject_version' : SID,
            'GNAV_DS_VERSION': SVERSION,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("rejectVersion", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    changeVersionStatus: function(SID, SVERSION, STATUS, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_change_version_status' : SID,
            'GNAV_DS_VERSION': SVERSION,
            'GNAV_NSTATUS': STATUS,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("changeVersionStatus", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    add_survey_by_text: function(survey_name, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_add_survey' : survey_name,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_admin.failRequest("add_survey_by_text", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    admin_upload_xl : function () {
		// using wordpress
		event.preventDefault();
		var form = document.forms.namedItem("GNAV_ADMIN_FORM_DATA_UPLOAD");
		var fdata = new FormData(form);
		fdata.append('GNAV_ADMIN_Data_upload', '1');
        jQuery('.overlay').addClass('hideContent');
        GNAV_MAIN.show_spinner();
		GNAV_MAIN.showStatusMessage("uploading file");
		jQuery.ajax({
			type : 'POST',
			url : GNAV_admin_local.GNAV_ajax_url,
			action : 'gnav_proc',
			'GNAV_ADMIN_Data_upload' : '1',
			security : GNAV_admin_local.ajax_nonce,
			contentType : false,
			processData : false,
			data : fdata,
			success : function (data, textStatus, jqXHR) {
                jQuery('.overlay').removeClass('hideContent');
                GNAV_MAIN.remove_spinner();
                GNAV_admin.showUploadResult(data);
                GNAV_admin.reloadPage();
                
				//alert("response: " + data);
			},
			error : function (jqXHR, textStatus, errorThrown) {
                jQuery('.overlay').removeClass('hideContent');
                GNAV_MAIN.remove_spinner();
				alert('ERRORS: ' + textStatus);
			}
		});
	},
    failRequest : function (fName, xhr, textStatus, err) {
        console.log("failed function: " + fName);
        console.log("readyState: " + xhr.readyState);
        console.log("responseText: " + xhr.responseText);
        console.log("status: " + xhr.status);
        console.log("text status: " + textStatus);
        console.log("error: " + err);
    }
};