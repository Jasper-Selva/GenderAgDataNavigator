/*
- part of the GNAV plugin
- generates the selector itself
- Author: Jasper van der Hout
- 

*/

"use strict";
var GNAV_SELECT = {
	GNAV_SELECT_DATA_URL : document.URL,
	GNAV_SELECT_SelectResDiv : 0, // div to display the results of the selection
	GNAV_SELECT_SurveyInfoDiv : 0, // div to display the metadata of the selected survey
	GNAV_SELECT_mapDiv : 0,
	GNAV_SELECT_leafletMap : 0,
	GNAV_SELECT_mapJSON : 0,
	GNAV_SELECT_JSON_LAYER : 0,
	GNAV_SELECT_SELECT_ORIGIN : "root",
	GNAV_SELECT_selectorData : 0, //[c_ID, c_Name, c_Parent]
	GNAV_SELECT_scoreData : 0,
	GNAV_SELECT_allSurveys : 0,
	GNAV_SELECT_selectedSurveys : 0,
    GNAV_SELECT_ScoreCatOrder: 0, 
    GNAV_SELECT_DataCatOrder: 0,
    GNAV_SELECT_MetaCatOrder: 0,
    GNAV_SELECT_MetaCatDefs: 0,
	GNAV_SELECT_AllDefs: 0,
	GNAV_SELECT_resList : 0,
	GNAV_SELECT_ScoreDefs : [], // array of scoredefinitions
    GNAV_SELECT_surveyScoreCache : {
		csvs : []
	},
    GNAV_SELECT_SELECTION_MADE: false,
	GNAV_SELECT_currentSelection: 0,
	GNAV_SELECT_BS_Popover_options : {
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
	GNAV_SELECT_DrawActive : 0,
	GNAV_SELECT_UL_FILE : 0,
	GNAV_SELECT_SHOW_ADMIN : true,
	GNAV_SELECT_SHOW_MAP_ALERT : false,
	GNAV_SELECT_URL_LString : "#GNAV_SELECT_SELECTION",
	GNAV_SELECT_URL_GENDER_CASE_STUDIES : "https://gender.cgiar.org/information-resources/data/gender-research-studies",
    init : function () {
		// the container divs.
		GNAV_SELECT.GNAV_SELECT_SelectResDiv = document.getElementById('GNAV_SELECT_RES_CNTNT');
		GNAV_SELECT.GNAV_SELECT_SurveyInfoDiv = document.getElementById('GNAV_DESCRIPTION_CONTAINER');
		GNAV_SELECT.GNAV_SELECT_mapDiv = document.getElementById('GNAV_SELECT_MAPLET');
		// SETTING the AJAX URL
		GNAV_SELECT.GNAV_SELECT_DATA_URL = GNAV_admin_local.GNAV_ajax_url;
		//hide the description
		jQuery(GNAV_SELECT.GNAV_SELECT_SurveyInfoDiv).hide();
		// 2. GETTING DATA
        jQuery('.overlay').addClass('hideContent');
        GNAV_MAIN.show_spinner();
		var gnQ = d3_queue.queue(4)
			.defer(GNAV_SELECT.getAllScores)
			.defer(GNAV_SELECT.getAllSurveys)
			.defer(GNAV_SELECT.getCategories)
            .defer(GNAV_SELECT.getDisplayOrder)
            .defer(GNAV_SELECT.getMetaCatDefs)
			.defer(GNAV_SELECT.getDefinitions)
			.await(function (error, AllScoreRes, allSurveysRes, categRes, DPO, MCD, ADEF) {
				if (error) {
                    GNAV_MAIN.remove_spinner();
                    jQuery('.overlay').removeClass('hideContent');
					throw error;
				} else {
					GNAV_MAIN.showStatusMessage("got all data");
					GNAV_SELECT.GNAV_SELECT_scoreData = AllScoreRes;
					GNAV_SELECT.GNAV_SELECT_allSurveys = allSurveysRes;
					GNAV_SELECT.GNAV_SELECT_selectorData = categRes;
                    GNAV_SELECT.setDisplayOrder(DPO);
                    GNAV_SELECT.GNAV_SELECT_MetaCatDefs=MCD;
					GNAV_SELECT.GNAV_SELECT_AllDefs=ADEF;
					GNAV_SELECT.createSelectors();
					GNAV_SELECT.createSurveyList();
					GNAV_SELECT.addActivityBar();
					GNAV_SELECT.displayValueInfo();
					GNAV_SELECT.updateFromHref();
                    
				}
                GNAV_MAIN.remove_spinner();
                jQuery('.overlay').removeClass('hideContent');
			});
		var geoQ = d3_queue.queue(1)
			.defer(GNAV_SELECT.getGeoJSON)
			.await(function (error, geoJSON) {
				if (error) {
					throw error;
				}
				GNAV_SELECT.GNAV_SELECT_mapJSON = JSON.parse(geoJSON);
				GNAV_SELECT.createMap();
			});
	},
	/*****************************/
	/****** survey selector ******/
	/*****************************/
	createSelectors : function () {
		// start at the root
		GNAV_MAIN.showStatusMessage("building selector");
		var rootID = GNAV_SELECT.getIDbyName(GNAV_SELECT.GNAV_SELECT_SELECT_ORIGIN);
		var lvl = 0; // accordion level
        var iList =jQuery('ul#GNAV_SELECT_ROOT');
        jQuery(iList).empty();
		GNAV_MAIN.showStatusMessage("building the selector");
		GNAV_SELECT.appendChildCategories(rootID, iList, lvl);
        GNAV_SELECT.initAccordion();
        GNAV_SELECT.setAct();
	},
    appendChildCategories: function(parentCatID, parentElement, lvl){
        var children= GNAV_SELECT.getChildren(parentCatID);
        var i,iM = children.length;
        var l, lClone, lContent;
        var t, tClone, tContent;
        var lH,lU;
        var catH, catHT, catImg;
        var myLVL = lvl+1;
        var myULElement;
        l = document.querySelector("template#GNAV_SELECT_LITEM_TMPLT");
        t = document.querySelector("template#GNAV_SELECT_CAT_HEAD");
        var myGUID;
        var key;
        for (i=0; i<iM; i+=1 ){
            myGUID = GNAV_SELECT.guid();
			if(!GNAV_MAIN.supportsTemplate){
				lClone=GNAV_MAIN.getTemplateCloneIE("GNAV_SELECT_LITEM_TMPLT");
				tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_SELECT_CAT_HEAD");
			}
			else{
				lClone=l.cloneNode(true,true);
				tClone = t.cloneNode(true, true);
			}
			lContent=lClone.content;
			tContent = tClone.content;

            lH = jQuery(lContent).children('.GNAV_SELECT_LITEM');
            lU =jQuery(lContent).find('.GNAV_SELECT_ULITEM');
            catH = jQuery(tContent).children('.GNAV_SELECT_CATH');
            catHT= jQuery(tContent).find('.GNAV_SELECT_HTEXT');
            catImg=jQuery(tContent).find('img.GNAV_SELECT_exp_arrow');
            
            for (key in children[i]){
                if(children[i].hasOwnProperty(key)){
                    jQuery(lH).attr(key, children[i][key]);
                    jQuery(catH).attr(key, children[i][key]);
                }
            }
            jQuery(lH).addClass('gnav_lvl'+myLVL);
            
            jQuery(lH).attr('gnav_ctrl', myGUID);
            jQuery(lU).attr('gnav_ctrlby',myGUID);
            
            jQuery(catH).attr('scorecat',children[i].GNAV_SCAT);
            jQuery(catH).attr('GNAV_LVL',myLVL);
            
            jQuery(catH).addClass('gnav_lvl'+myLVL);
            jQuery(catImg).attr('src',GNAV_admin_local.GNAV_ARROW_DOWN);
            jQuery(catHT).text(children[i].GNAV_DESCRIPTION);
            
            jQuery(lH).prepend(tContent);
            
            
            //myULElement=jQuery(parentElement).find('.GNAV_SELECT_ULITEM[parentcat="'+children[i].GNAV_SCAT+'"]');
            myULElement=lU;
            GNAV_SELECT.appendValues(children[i].GNAV_SCAT,"","",myULElement,myLVL);
            GNAV_SELECT.appendDataCats(children[i].GNAV_SCAT, myULElement, myLVL);
            GNAV_SELECT.appendChildCategories(children[i].GNAV_SCAT, myULElement,myLVL);
            jQuery(parentElement).append(lContent);
			
			// cleanup, lets see if this helps to reduce memory usage
			tClone = null;
			lClone = null;
            
        }
    },
    appendDataCats: function(parentCatID, parentElement, lvl){
        var myDCats= GNAV_SELECT.getMyDataCats(parentCatID); //[[GNAV_DCAT, GNAV_YNQUESTION]],..
        var i, iM=myDCats.length;
        var t, tClone, tContent;
        var l, lClone, lContent;
        var lH, lU, catH, catHT, catImg;

        l = document.querySelector("template#GNAV_SELECT_LITEM_TMPLT");
        t = document.querySelector("template#GNAV_SELECT_CAT_HEAD");
        
        var myGUID;
        var myParentGUID, myParentLI_element;
        var myULElement;
        var myLVL = lvl+1;
        var YNQDESC;
        
        for (i=0; i<iM; i+=1){
			if(!GNAV_MAIN.supportsTemplate){
				lClone=GNAV_MAIN.getTemplateCloneIE("GNAV_SELECT_LITEM_TMPLT");
				tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_SELECT_CAT_HEAD");
			}
			else{
				lClone=l.cloneNode(true,true);
				tClone = t.cloneNode(true, true);
			}
            lContent=lClone.content;
            tContent = tClone.content;
            myGUID = GNAV_SELECT.guid();
            
            lH = jQuery(lContent).children('.GNAV_SELECT_LITEM');
            lU =jQuery(lContent).find('.GNAV_SELECT_ULITEM');
            catH = jQuery(tContent).children('.GNAV_SELECT_CATH');
            catHT= jQuery(tContent).find('.GNAV_SELECT_HTEXT');
            catImg=jQuery(tContent).find('img.GNAV_SELECT_exp_arrow');
            
            jQuery(lH).attr('GNAV_SCAT', parentCatID);
            jQuery(lH).attr('GNAV_DCAT', myDCats[i][0]);
            jQuery(lH).attr('gnav_ctrl', myGUID);
            jQuery(lH).addClass('gnav_lvl'+myLVL);
            if(myDCats[i][1]!=""){
                jQuery(lH).attr('GNAV_YNQUESTION', myDCats[i][1]);
                jQuery(lU).attr('GNAV_YNQUESTION', myDCats[i][1]);
                jQuery(catH).attr('GNAV_YNQUESTION', myDCats[i][1]);
                
                }
            jQuery(lU).attr('GNAV_SCAT', parentCatID);
            jQuery(lU).attr('GNAV_DCAT', myDCats[i][0]);
            jQuery(lU).attr('gnav_ctrlby', myGUID);
            
            jQuery(catH).attr('GNAV_SCAT',parentCatID);
            jQuery(catH).attr('GNAV_DCAT', myDCats[i][0]);
            
            jQuery(catH).attr('GNAV_LVL',myLVL);
            jQuery(catH).addClass('gnav_lvl'+myLVL);
            jQuery(catImg).attr('src',GNAV_admin_local.GNAV_ARROW_DOWN);

          
            jQuery(lH).prepend(tContent);
            jQuery(parentElement).append(lContent);
            
            myULElement=jQuery(parentElement).find('.GNAV_SELECT_ULITEM[gnav_ctrlby="'+myGUID+'"]');
            
            if(myDCats[i][0]=="YNQuestion"){
                //jQuery(DLI).attr('GNAV_YNQUESTION', myCats[i][1]);
                YNQDESC=GNAV_SELECT.getMyYNQuestion(parentCatID, myDCats[i][1]);
                jQuery(catHT).text(YNQDESC);
                GNAV_SELECT.appendValues(parentCatID, myDCats[i][0], myDCats[i][1], myULElement, lvl);
            }
            else{
                jQuery(catHT).text(myDCats[i][0]);
                GNAV_SELECT.appendValues(parentCatID, myDCats[i][0], "", myULElement, lvl);
            }
            
        }
        if(iM>0){
            myParentGUID=jQuery(parentElement).attr('gnav_ctrlby');
            myParentLI_element=jQuery('li.GNAV_SELECT_LITEM[gnav_ctrl="'+myParentGUID+'"]'); 
            jQuery(myParentLI_element).addClass('hasDataCats');
        }
		// cleanup
		l= null; t=null; lClone=null; tClone=null;
		
    },
    appendValues: function(parentCatID, DCAT, GNAV_YNQUESTION, parentElement, lvl){
		// append all the values for a given scorecat/datacat/ynquestion
		
        var children = GNAV_SELECT.getMyValues(parentCatID, DCAT, GNAV_YNQUESTION);
        var t, tClone, tContent;
        var i,iM = children.length;
        var key;
        var myParentGUID, myParentLI_element;
        var QLI, QQT, QVT, QI;

        t = document.querySelector("template#GNAV_SELECT_QEL_TMPLT");
        for (i=0; i<iM; i+=1 ){
			if(!GNAV_MAIN.supportsTemplate){
				tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_SELECT_QEL_TMPLT");
			}
			else{
				tClone = t.cloneNode(true, true);
			}
            tContent = tClone.content;
            QLI = jQuery(tContent).children('.GNAV_SELECT_QEL');
            QQT = jQuery(tContent).find('span.GNAV_SELECT_YNQT');
            QVT = jQuery(tContent).find('span.GNAV_SELECT_QELT');
            QI = jQuery(tContent).find('input.GNAV_SELECT_QSEL');
            jQuery(QVT).text(children[i].GNAV_VALUE);
            
            if(children[i].hasOwnProperty('GNAV_DESCRIPTION') && children[i].GNAV_DESCRIPTION && children[i].GNAV_DESCRIPTION.length<30){
                    jQuery(QVT).text(children[i].GNAV_DESCRIPTION);
            }
            for (key in children[i]){
                if(children[i].hasOwnProperty(key)){
                    jQuery(QI).attr(key, children[i][key]);
                    jQuery(QLI).attr(key, children[i][key]);
                }
            }
            jQuery(parentElement).append(tContent);
        }
        if(iM>0){
            myParentGUID=jQuery(parentElement).attr('gnav_ctrlby');
            myParentLI_element=jQuery('li.GNAV_SELECT_LITEM[gnav_ctrl="'+myParentGUID+'"]'); 
            jQuery(myParentLI_element).addClass('hasValues');
        }
		// cleanup
		t=null; tClone=null;
    },
    initAccordion: function(){
		// as the entire selector is built as being expanded, this function sets all as collapsed
        jQuery('ul.GNAV_SELECT_ULITEM').slideUp('fast');
        jQuery('ul.GNAV_SELECT_ULITEM').addClass('in');
        var ctrl_uid;
        var ck;
        var selectArrow, selectAll;
        jQuery('.GNAV_SELECT_LITEM').each(function(){
            ctrl_uid=jQuery(this).attr('gnav_ctrl');
            ck=GNAV_SELECT.checkedCount(ctrl_uid);
            selectArrow=jQuery(this).find('img.GNAV_SELECT_exp_arrow').first();
            selectAll=jQuery(this).find('input.GNAV_SELECT_selectAll').first();
            if(ck[1]>0){
                jQuery(selectArrow).addClass('hasValues');
                jQuery(selectAll).addClass('hasValues');
            }
        });
        return;
        /*
		jQuery('ul.GNAV_SELECT_ULITEM').collapse({
				toggle : false
			});
        jQuery('ul.GNAV_SELECT_ULITEM').removeClass('in');
        jQuery('ul.GNAV_SELECT_ULITEM').attr('aria-expanded', 'false');
        jQuery('ul.GNAV_SELECT_ULITEM').css('height', '0px');
		*/
    },
	setAct: function(){
		// this function initializes allmost all the actions.
		// as it is called on multiple occasions, first all the actions are removed.
        // set all off
        jQuery('span.GNAV_SELECT_HTEXT').off('click');
        jQuery('span.GNAV_SELECT_QELT').off('click');
		jQuery('span.GNAV_SELECT_QELT').off('hover');
        jQuery('input.GNAV_SELECT_QSEL').off('change');
        jQuery('.GNAV_SELECT_valElement').off('hover');
        jQuery('.GNAV_SELECT_valElement').off('click');
        jQuery('span.GNAV_SELECT_EXP_INDIC').off('click');
        jQuery('.GNAV_SELECT_DCAT_LI_CONTENTHT').off('click');
        jQuery('input.GNAV_SELECT_selectAll').off('change');
        /*
		jQuery('.GNAV_SELECT_ULITEM').off('shown.bs.collapse');
        jQuery('.GNAV_SELECT_ULITEM').off('hidden.bs.collapse');
		*/
        jQuery('span.GNAV_SELECT_valElement').hover(function(e){
            var cSC = jQuery(this).attr('gnav_scat');
            var cSV =jQuery(this).attr('scoreVal');
            jQuery('.GNAV_SELECT_QEL[parentCat="'+cSC+'"][gnav_value="'+cSV+'"]').addClass('GNAV_SELECT_VOVER');
            e.stopPropagation();
        },function(e){
            var cSC = jQuery(this).attr('gnav_scat');
            var cSV =jQuery(this).attr('scoreVal');
            jQuery('.GNAV_SELECT_QEL[parentCat="'+cSC+'"][gnav_value="'+cSV+'"]').removeClass('GNAV_SELECT_VOVER');
            e.stopPropagation();
        });
        jQuery('.GNAV_SELECT_valElement').click(function(e){
            e.stopPropagation();
            var cSC = jQuery(this).attr('gnav_scat');
            var cSV = jQuery(this).attr('gnav_value');
            var cSD = jQuery(this).attr('gnav_dcat');
            var valElement;
            var cYNQ;
            if (typeof cSD !== typeof undefined && cSD !== false) {
                if(cSD=="YNQuestion"){
                    cYNQ=jQuery(this).attr('gnav_ynquestion');
                    valElement=jQuery('input.GNAV_SELECT_QSEL[gnav_scat="'+cSC+'"][gnav_value="'+cSV+'"][gnav_ynquestion="'+cYNQ+'"]');
                }
                else{
                    valElement=jQuery('input.GNAV_SELECT_QSEL[gnav_scat="'+cSC+'"][gnav_value="'+cSV+'"][gnav_dcat="'+cSD+'"]');
                }
            }
            else{
                valElement=jQuery('input.GNAV_SELECT_QSEL[gnav_scat="'+cSC+'"][gnav_value="'+cSV+'"]');
            }
            //<span class="GNAV_SELECT_valElement" gnav_value="N" gnav_value_desc="No" gnav_scat="ff33061de58a64f3f9717aef34353ab6" gnav_scat_desc="Housing and Other Assets" gnav_dcat="YNQuestion" gnav_ynquestion="d4a7a5ea9e8cb29ca182683914d7fb7b" gnav_ynquestion_desc="Collects info on joint household assets ownership and decisionmaking">N</span>
            //<input type="checkbox" class="GNAV_SELECT_QSEL" gnav_value="N" gnav_value_desc="No" gnav_scat="ff33061de58a64f3f9717aef34353ab6" gnav_scat_desc="Housing and Other Assets" gnav_dcat="YNQuestion" gnav_ynquestion="d4a7a5ea9e8cb29ca182683914d7fb7b" gnav_ynquestion_desc="Collects info on joint household assets ownership and decisionmaking">
            var LI_EL=jQuery(valElement).parent('.GNAV_SELECT_QEL');
            jQuery(LI_EL).removeClass('HL');
            jQuery(valElement).prop('checked', false);
            jQuery(valElement).trigger('change');
        });
        jQuery('.GNAV_SELECT_DCAT_LI_CONTENTHT').click(function(){
            var listParent = jQuery(this).parents('li.GNAV_SELECT_LITEM').first();
            var ulChild = jQuery(listParent).find('.GNAV_SELECT_ULITEM').first();
            GNAV_SELECT.jCollapse(ulChild);
			//jQuery(ulChild).collapse('toggle');
        });
        jQuery('span.GNAV_SELECT_HTEXT').click(function(){
            var listParent= jQuery(this).parents('li.GNAV_SELECT_LITEM').first();
            var ulChild=jQuery(listParent).find('.GNAV_SELECT_ULITEM').first();
            var selectArrow=jQuery(listParent).find('img.GNAV_SELECT_exp_arrow').first();
            var selectAll=jQuery(listParent).find('input.GNAV_SELECT_selectAll').first();
            
            if(jQuery(ulChild).hasClass('in')){
                jQuery(selectArrow).addClass('exp');
                jQuery(selectAll).addClass('exp');
            }
            else{
                jQuery(selectArrow).removeClass('exp');
                jQuery(selectAll).removeClass('exp');
            }
            GNAV_SELECT.jCollapse(ulChild);
            });
        jQuery('span.GNAV_SELECT_EXP_INDIC').click(function(){
            var listParent= jQuery(this).parents('li.GNAV_SELECT_LITEM').first();
            var ulChild=jQuery(listParent).find('.GNAV_SELECT_ULITEM').first();
            GNAV_SELECT.jCollapse(ulChild);
            });
        jQuery('span.GNAV_SELECT_QELT').click(function(){
            var myCB = jQuery(this).parent().find('input.GNAV_SELECT_QSEL');
            myCB.prop("checked", !myCB.prop("checked"));
            myCB.trigger('change');
            GNAV_SELECT.hidePopup(jQuery(this));
            });
        jQuery('span.GNAV_SELECT_QELT').hover(
            function(){
                var myParent=jQuery(this).parent('.GNAV_SELECT_QEL');
                var GNAV_VALUE= jQuery(myParent).attr('gnav_value');
                var GNAV_DESC=jQuery(myParent).attr('gnav_description');
                jQuery(this).addClass('hover');
                if(GNAV_DESC){
                    GNAV_SELECT.showPopup(jQuery(this), GNAV_VALUE, GNAV_DESC);
                }
            },
            function(){
                jQuery(this).removeClass('hover');
                GNAV_SELECT.hidePopup(jQuery(this));
            });
        jQuery('input.GNAV_SELECT_QSEL').change(function(){
			//jQuery(this).fadeOut(200, function(){jQuery(this).prop('disabled', true);}).delay(1000).fadeIn(200, function(){jQuery(this).prop('disabled', false);});
            var parentListElement=jQuery(this).parents('.GNAV_SELECT_LITEM').first();
            var parentH = jQuery(parentListElement).find('.GNAV_SELECT_CONTENTHV').first();
            var myVal = jQuery(this).attr('gnav_value');
            var ctrl_ID= jQuery(parentListElement).attr('gnav_ctrl');
            
            if(jQuery(this).prop('checked')){
                var attrName, attrValue;
                var valueObject={};
                jQuery.each(this.attributes, function(i, attrib){
                     attrName = attrib.name;
                     attrValue = attrib.value;
                     if(attrName.substring(0,4)=='gnav'){
                        valueObject[attrName]=attrValue;
                     }
                });
                GNAV_SELECT.addValueElement(parentH,valueObject);
            }
            else{
                GNAV_SELECT.removeValueElement(parentH,myVal);
            }
            GNAV_SELECT.setCheckAll(ctrl_ID);
            GNAV_SELECT.updateSelection();
        });
        jQuery('input.GNAV_SELECT_selectAll').change(function (e) {
            e.stopPropagation();
            var parentElement=jQuery(this).parents('.GNAV_SELECT_LITEM').first();
            var ctrl_uid= jQuery(parentElement).attr('gnav_ctrl');
            GNAV_SELECT.toggleAll(ctrl_uid);
        });
        /*
		jQuery('.GNAV_SELECT_ULITEM').on('shown.bs.collapse', function (e) {
            e.stopPropagation();
            var selectArrow, selectAll;
            var ctrl_uid= jQuery(this).attr('gnav_ctrlby');
            var li_element = jQuery('.GNAV_SELECT_LITEM[gnav_ctrl="'+ctrl_uid+'"]');
            var ck=GNAV_SELECT.checkedCount(ctrl_uid);
            
            var contentElement=jQuery('#GNAV_SELECT_CNTNT');
            if (li_element){
                selectArrow=jQuery(li_element).find('img.GNAV_SELECT_exp_arrow').first();
                selectAll=jQuery(li_element).find('input.GNAV_SELECT_selectAll').first();
                if(ck[1]>0){
                    jQuery(selectArrow).addClass('hasValues');
                    jQuery(selectAll).addClass('hasValues');
                }
                jQuery(selectArrow).addClass('exp');
                jQuery(selectAll).addClass('exp');
                GNAV_SELECT.scrollTo(contentElement,li_element);
            }
        });
        jQuery('.GNAV_SELECT_ULITEM').on('hidden.bs.collapse', function (e) {
            e.stopPropagation();
            var selectArrow, selectAll;
            var ctrl_uid= jQuery(this).attr('gnav_ctrlby');
            var li_element= jQuery('.GNAV_SELECT_LITEM[gnav_ctrl="'+ctrl_uid+'"]');
            var ck=GNAV_SELECT.checkedCount(ctrl_uid);
            if (li_element){
                selectArrow=jQuery(li_element).find('img.GNAV_SELECT_exp_arrow').first();
                selectAll=jQuery(li_element).find('input.GNAV_SELECT_selectAll').first();
                if(ck[1]>0){
                    jQuery(selectArrow).addClass('hasValues');
                    jQuery(selectAll).addClass('hasValues');
                }
                jQuery(selectArrow).removeClass('exp');
                jQuery(selectAll).removeClass('exp');
            }
        });
		*/
    },
    jCollapse: function(element){
        if(!element){return;}
        jQuery(element).stop();
        jQuery(element).addClass('exp_trans');
        if(jQuery(element).hasClass('in')){
            jQuery(element).slideDown('fast', function(){jQuery(this).removeClass('exp_trans');});
            jQuery(element).removeClass('in');
        }
        else{
            jQuery(element).slideUp('fast', function(){jQuery(this).removeClass('exp_trans');});
            jQuery(element).addClass('in');
        }
    },
    addValueElement: function(parentElement, valueObject){
        var iSpan= document.createElement('span');
        jQuery(iSpan).addClass('GNAV_SELECT_valElement');
        var key;
        for (key in valueObject){
            if(valueObject.hasOwnProperty(key)){
                jQuery(iSpan).attr(key, valueObject[key]);
            }
        }
        if(valueObject.hasOwnProperty('gnav_value')){
            jQuery(iSpan).text(GNAV_SELECT.shortString(valueObject.gnav_value, 6));
        }
        jQuery(parentElement).append(iSpan);
        GNAV_SELECT.setAct();
        
    },
    removeValueElement: function(parentElement, gnav_value){
        var myValueElements=jQuery(parentElement).children('.GNAV_SELECT_valElement');
        jQuery(myValueElements).each(function(){
            if(jQuery(this).attr('gnav_value')==gnav_value){
                jQuery(this).remove();
            }
        });
    },
    setCheckAll: function(cntrl_id){
        var ctrl_item=jQuery('li.GNAV_SELECT_LITEM[gnav_ctrl="'+cntrl_id+'"]');
        var cb_sa=jQuery(ctrl_item).find('.GNAV_SELECT_selectAll');
        var cc=GNAV_SELECT.checkedCount(cntrl_id);
        if(cc[0]==0){
            jQuery(cb_sa).prop('indeterminate', false);
            jQuery(cb_sa).prop('checked', false);
            jQuery(ctrl_item).removeClass('hasSelection');
        }
        else if(cc[0]==cc[1]){
            jQuery(cb_sa).prop('indeterminate', false);
			jQuery(cb_sa).prop('checked', true);
            jQuery(ctrl_item).addClass('hasSelection');
            
        }
        else{
            jQuery(cb_sa).prop('indeterminate', true);
            jQuery(ctrl_item).addClass('hasSelection');
        }
    },
    toggleAll : function(cntrl_id){
        var ctrl_by_item = jQuery('ul.GNAV_SELECT_ULITEM[gnav_ctrlby="'+cntrl_id+'"]');
        var ctrl_item = jQuery('li.GNAV_SELECT_LITEM[gnav_ctrl="'+cntrl_id+'"]'); 
        var valueSB = jQuery(ctrl_item).find('.GNAV_SELECT_CONTENTHV').first();
        var chk_all = jQuery(ctrl_item).find('.GNAV_SELECT_selectAll').first();
        var itemState =jQuery(chk_all).prop('checked');
        var cb = jQuery(ctrl_by_item).find('input.GNAV_SELECT_QSEL');
        var valueObject;
        var attrName, attrValue;
        //var cc = GNAV_SELECT.checkedCount(cntrl_id);
        jQuery(cb).each(function(){
            jQuery(this).prop("checked", itemState);
            if(itemState){
                valueObject={};
                jQuery.each(this.attributes, function(i, attrib){
                     attrName = attrib.name;
                     attrValue = attrib.value;
                     if(attrName.substring(0,4)=='gnav'){
                        valueObject[attrName]=attrValue;
                     }
                });
                GNAV_SELECT.addValueElement(valueSB,valueObject);
                
            }
            else{
                attrValue=jQuery(this).attr('gnav_value');
                GNAV_SELECT.removeValueElement(valueSB,attrValue);
            }
        });
        if(itemState){jQuery(ctrl_item).addClass('hasSelection');}
        else{jQuery(ctrl_item).removeClass('hasSelection');}
            
        GNAV_SELECT.updateSelection();
    },
	collapseSelector : function () {
		jQuery('.GNAV_SELECT_ULITEM').stop();
		jQuery('.GNAV_SELECT_ULITEM').addClass('exp_trans');
		jQuery('.GNAV_SELECT_ULITEM').each(function(){
			jQuery(this).slideUp('fast', function(){jQuery(this).removeClass('exp_trans');});
		});
		jQuery('.GNAV_SELECT_ULITEM').addClass('in');
		jQuery('img.GNAV_SELECT_exp_arrow').removeClass('exp');
        jQuery('input.GNAV_SELECT_selectAll').removeClass('exp');
	},
	/*************************/
	/**** the survey list ****/
	/*************************/
	createSurveyList : function () {
		//draw the surveys as a list in gnResults
		GNAV_MAIN.showStatusMessage("building survey list");
        jQuery(GNAV_SELECT.GNAV_SELECT_SelectResDiv).empty();
		var iList = document.createElement('ul');
        /****** surveyList ******/
		iList.setAttribute('id', 'GNAV_SELECT_res_root');
		iList.className = ('GNAV_SELECT_result_list');
		jQuery(GNAV_SELECT.GNAV_SELECT_SelectResDiv).append(iList);
		GNAV_SELECT.GNAV_SELECT_resList = iList;
		GNAV_SELECT.addAllSurveys();
		// create all survey list elements here!!
	},
	addAllSurveys : function () {
		var i,
		iM = GNAV_SELECT.GNAV_SELECT_allSurveys.length;
		for (i = 0; i < iM; i += 1) {
			GNAV_SELECT.createSurveyListElement(GNAV_SELECT.GNAV_SELECT_allSurveys[i]);
		}
		/*
		jQuery('li.GNAV_SELECT_res_li').collapse({
			toggle : false
		});
		*/
		jQuery('li.GNAV_SELECT_res_li').hover(function () {
			jQuery(this).addClass('hover');
		});
        jQuery('li.GNAV_SELECT_res_li').hover(function(){
            jQuery(this).addClass('hover');
            var myID=jQuery(this).attr('sid');
            var myVersion=jQuery(this).attr('sversion');
            GNAV_SELECT.showSelectionReason(myID, myVersion);
            },
            function(){
                jQuery(this).removeClass('hover');
                GNAV_SELECT.hidePopup(jQuery(this));
                jQuery('li.GNAV_SELECT_QEL').removeClass('highlight');
            });
		jQuery('li.GNAV_SELECT_res_li').click(function (event) {
			event.preventDefault();
			jQuery('.GNAV_SELECT_res_li').removeClass('selected');
			GNAV_SELECT.clearSurveyInfo();
			var myID = jQuery(this).attr('sID');
            var myVersion=jQuery(this).attr('sversion');
            var myChild = jQuery('#GNAV_SELECT_SURVEY_NAME');
			jQuery(this).addClass('selected');
			
            GNAV_SELECT.showSurveyInfo(myID,myVersion);
            jQuery(myChild).html(jQuery(this).attr('surveyname'));
		});
	},
	createSurveyListElement : function (surveyElement) {
		// create the list element
		var t, tClone;
		var ListElem, listHeader,
		LEID;
		if(!GNAV_MAIN.supportsTemplate){
			tClone=GNAV_MAIN.getTemplateCloneIE("suveyListItem");
		}
		else{
			t=document.querySelector("template#suveyListItem");
			tClone=t.cloneNode(true, true);
			
		}
		ListElem = tClone.content.querySelector("li");
		listHeader = tClone.content.querySelector("span");

        var key;
        for (key in surveyElement){
            if(surveyElement.hasOwnProperty(key)){
                ListElem.setAttribute(key, surveyElement[key]);
                listHeader.setAttribute(key, surveyElement[key]);
            }
        }
        listHeader.textContent = surveyElement.surveyName;
		if (!!GNAV_MAIN.supportsTemplate) {
			jQuery(GNAV_SELECT.GNAV_SELECT_resList).append(tClone.content);
		}
		else{
			jQuery(GNAV_SELECT.GNAV_SELECT_resList).append(tClone.content);
		}
			
		
	},
	/************************/
	/****** surveyInfo ******/
	/************************/
	clearSurveyInfo : function () {
		// set opacity to 0
		jQuery(GNAV_SELECT.GNAV_SELECT_SurveyInfoDiv).animate({
			opacity : 0
		}, 500);
		jQuery("#GNAV_SELECT_META_UL").empty();
        jQuery('#GNAV_SELECT_SURVEY_NAME').empty();
		jQuery("li.GNAV_SELECT_res_li.selected").removeClass("selected");
        GNAV_SELECT.hideMap();
	},
	showSurveyInfo : function (surveyID, sVersion) {
		jQuery(GNAV_SELECT.GNAV_SELECT_SurveyInfoDiv).show();
		jQuery(GNAV_SELECT.GNAV_SELECT_SurveyInfoDiv).stop();
		var q = d3_queue.queue(2)
			.defer(GNAV_SELECT.getSurveyMetaData, surveyID, sVersion)
			.await(function (error, svMetaD){ //, svYEARS, svCNTRY) {
				if (!error) {
					var svName = GNAV_SELECT.getSurveyNameByID(surveyID);
					jQuery('#GNAV_SELECT_SURVEY_NAME').html(svName);
					GNAV_SELECT.setMetaData(svMetaD);
					jQuery(GNAV_SELECT.GNAV_SELECT_SurveyInfoDiv).animate({
						opacity : 1
					}, 500);
				}
			});
	},
	createInfoListItem: function(GNAV_MCAT, GNAV_MVALUES){
        var lItem = document.createElement('li');
        var itemDiv = document.createElement('div');
        var valueDiv = document.createElement('div');
        var i, iM=GNAV_MVALUES.length;
        var mItem, brItem, mItemText="";
        var sHref;
		jQuery(lItem).addClass('GNAV_SELECT_SINFO_LI');
		jQuery(itemDiv).addClass('GNAV_SELECT_SINFO_ITEM');
		jQuery(valueDiv).addClass('GNAV_SELECT_SINFO_VALUE');
        jQuery(itemDiv).html(GNAV_SELECT.getMetaDef(GNAV_MCAT));        
        if(iM==1){ brItem="";}
        else if(iM<=4){brItem="<br/>";}
        else{ brItem="; ";}
        for(i=0; i<iM; i+=1){
            mItem=GNAV_MVALUES[i].GNAV_DESCRIPTION;
            if (GNAV_SELECT.isURL(mItem)){
                sHref = document.createElement('a');
                sHref.setAttribute('href', mItem);
                sHref.setAttribute('target', '_blank');
                sHref.innerHTML = mItem;
                jQuery(valueDiv).append(sHref);
            }
            else{
                mItemText+=mItem;
            }
            if(i<(iM-1)){mItemText+=brItem;}
        }
        jQuery(valueDiv).append(mItemText);
        jQuery(lItem).append(itemDiv);
		jQuery(lItem).append(valueDiv);
		jQuery("#GNAV_SELECT_META_UL").append(lItem);
    },
    setMetaData : function (metaData) {
        var i, iM= GNAV_SELECT.GNAV_SELECT_MetaCatOrder.length;
        var c,cM = metaData.length;
        var cntry = [];
        var sMetaCat,sMetaItems;
        for (i=0; i<iM; i+=1){
            sMetaCat = GNAV_SELECT.GNAV_SELECT_MetaCatOrder[i].GNAV_VALUE;
            sMetaItems=[];
            for (c=0; c<cM; c+=1){
                if(metaData[c].GNAV_MCAT=="country_ISO3" && cntry.indexOf(metaData[c].GNAV_VALUE==-1)){cntry.push(metaData[c].GNAV_VALUE);}
                if(metaData[c].hasOwnProperty("GNAV_MCAT") && metaData[c].GNAV_MCAT==sMetaCat){
                    sMetaItems.push(metaData[c]);
                }
                if(sMetaCat=="persistentUrl" && metaData[c].GNAV_MCAT=="persistentUrl"){ GNAV_SELECT.setSurveyTitleLink(metaData[c].GNAV_VALUE);}
            }
            if(sMetaItems.length>0){
                GNAV_SELECT.createInfoListItem(sMetaCat, sMetaItems);
            }
        }
        if(cntry.length>0){ 
            GNAV_SELECT.showMap(cntry);}
        else{
            GNAV_SELECT.hideMap();}
    },
	setGenderCaseStudiesLink : function (countryData) {
		var cArray = [];
		var selString,
		fullURL;
		var urlParent = jQuery("#GNAV_SELECT_MAP_LINK");
		var nA;
		urlParent.empty();
		var i,
		iM = countryData.length;
		for (i = 0; i < iM; i += 1) {
			if (cArray.indexOf(countryData[i]) == -1) {
				cArray.push(countryData[i]);
			}
		}
		if (cArray.length > 0) {
			selString = "#&country=";
			iM = cArray.length;
			for (i = 0; i < iM; i += 1) {
				if (i > 0) {
					selString += ",";
				}
				selString += cArray[i];
			}
			fullURL = GNAV_SELECT.GNAV_SELECT_URL_GENDER_CASE_STUDIES + selString;
			nA = document.createElement("a");
			nA.setAttribute("href", fullURL);
			nA.setAttribute("target", "_blank");
			jQuery(nA).text("View related Gender Studies");
			urlParent.append(nA);
		}
	},
	/************************/
	/****** value info ******/
	/************************/
	displayValueInfo: function(){
		var parent=jQuery('#GNAV_SELECT_SHOW_DESCRIPTIONS');
		var dCats=["Question/Response Type", "Respondent", "Sex disaggregated"];
		var allValueDefs;
		var i, iM=dCats.length;
		var v, vM;
		var ul, he;
		for (i=0; i<iM; i+=1){
			ul=document.createElement('ul');
			jQuery(ul).addClass('GNAV_SELECT_SHOW_DESCRIPTIONS_UL');
			he=document.createElement('div');
			jQuery(he).addClass('GNAV_SELECT_SHOW_DESCRIPTIONS_HEADER');
			jQuery(he).text(dCats[i]);
			
			allValueDefs = GNAV_SELECT.getAllValueDefs(dCats[i]);
			vM=allValueDefs.length;
			var ignV="Experimental games";
			var iL = ignV.length;
			for (v=0;v<vM; v+=1){
				
				if (allValueDefs[v].GNAV_VALUE.substring(0, iL)!=ignV){
					GNAV_SELECT.addVItem(ul,allValueDefs[v]);
				}
			}
			jQuery(parent).append(he);
			jQuery(parent).append(ul);
		}
		var next_element=jQuery('#GNAV_SELECT');
		
		var mleft=25; //jQuery(parent).position().left;
		var mtop = 104;//next_element.offset().top - 104;
		jQuery(parent).offset({ top: mtop, left: mleft})

		jQuery("#GNAV_SELECT_show_info").off('click');
		jQuery("#GNAV_SELECT_show_info").click(function(){
			var dContainer=jQuery('#GNAV_SELECT_SHOW_DESCRIPTIONS');
			console.log("toggle input: " + jQuery('#GNAV_SELECT_popover_toggle_input').prop('checked'));
			if(jQuery(dContainer).hasClass('hidden')){
				jQuery('#GNAV_SELECT_popover_toggle_input').prop('checked', false);
				jQuery(dContainer).removeClass('hidden');}
			else{
				jQuery('#GNAV_SELECT_popover_toggle_input').prop('checked', true);
				jQuery(dContainer).addClass('hidden');}
		});
			
		
	},
	addVItem: function(parentUL, vDef){
		var t, tClone, tContent;
		t = document.querySelector("template#GNAV_DESC_LI_ITEM");
		if(!GNAV_MAIN.supportsTemplate){tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_DESC_LI_ITEM");}
		else{tClone = t.cloneNode(true, true);}
        tContent = tClone.content;
		
		var DVI = jQuery(tContent).find('span.GNAV_DESC_VALUE');
        var DVD = jQuery(tContent).find('span.GNAV_DESC_DESC');
		
		jQuery(DVI).text(vDef.GNAV_VALUE);
		jQuery(DVD).text(vDef.GNAV_DESCRIPTION);
		jQuery(parentUL).append(tContent);
	},
	/**************************/
	/****** activity bar ******/
	/**************************/ 
	addActivityBar : function () {
        //GNAV_SELECT_popover_toggle_input
		var t, tClone;
		var	parent = document.querySelector("#GNAV_SELECT_RES");
		
		if(!GNAV_MAIN.supportsTemplate){
			tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_SELECT_TEMPLATE_CONTROL_BAR");
		}
		else{
			t=document.querySelector("template#GNAV_SELECT_TEMPLATE_CONTROL_BAR");
			tClone=t.cloneNode(true, true);

		}
		
		jQuery(parent).append(tClone.content);
	
		var chBox = jQuery('#GNAV_SELECT_popover_toggle_input');
		jQuery(chBox).prop("checked", true);
		jQuery(chBox).change(function () {
			if (jQuery(this).is(":checked")) {
				GNAV_SELECT.GNAV_SELECT_showPopup = true;
			} else {
				GNAV_SELECT.GNAV_SELECT_showPopup = false;
                GNAV_SELECT.killAllPopups();
			}
		});
		jQuery('#GNAV_SELECT_reset_selector').mouseenter(function () {
			jQuery(this).addClass('hover');
		});
		jQuery('#GNAV_SELECT_reset_selector').mouseleave(function () {
			jQuery(this).removeClass('hover');
		});
		jQuery('#GNAV_SELECT_reset_selector').click(function () {
			GNAV_SELECT.clearSelection();
		});
        jQuery('button#GNAV_LOGIN').click(function(){
            var SD = d3_queue.queue()
            .defer(GNAV_SELECT.showLogin)
            .await(function(error, data){
                if(!error){
                    GNAV_SELECT.showLoginForm(data);
                }
            });
        });
        if(GNAV_admin_local.logged_in==0){
            jQuery('button#GNAV_LOGIN').addClass('enabled');
        }
        else{
            jQuery('button#GNAV_LOGIN').removeClass('enabled');
        }
	},
    showLoginForm: function(login_form_data){
        jQuery('.overlay').addClass('hideContent');
        jQuery('body').find('#GNAV_SELECT_LOGIN_CONTAINER').remove();
		var t, tClone, tContent;

		if(!GNAV_MAIN.supportsTemplate){
			tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_SELECT_LOGIN");
		}
		else{
			t=document.querySelector("template#GNAV_SELECT_LOGIN");
			tClone=t.cloneNode(true, true);
		}

		var tContainer = tClone.content.querySelector('.GNAV_SELECT_LOGIN_CONTAINER');
        jQuery(tContainer).attr('id', "GNAV_SELECT_LOGIN_CONTAINER");
        jQuery(tContainer).append(login_form_data);
        jQuery(document.body).append(tClone.content);
        jQuery('body').find('#GNAV_SELECT_LOGIN_CONTAINER').click(function(){
            jQuery(this).fadeOut(300, function(){
                jQuery(this).remove();
                jQuery('.overlay').removeClass('hideContent');
                });
            });
        jQuery('body').find('#GNAV_SELECT_LOGIN_CONTAINER').children().on("click", function(event){    
            event.stopPropagation();
        });
    },
	/*********************************/
	/****** site prettification ******/
	/*********************************/
    GNAV_SELECT_showPopup: function(){
        return jQuery('#GNAV_SELECT_popover_toggle_input').prop('checked');
    },
	setSurveyTitleLink : function (sURL) {
		var sTitle = jQuery('#GNAV_SELECT_SURVEY_NAME').html();
		var sHref = document.createElement('a');
		sHref.setAttribute('href', sURL);
		sHref.setAttribute('target', '_blank');
		sHref.innerHTML = sTitle;
		jQuery('#GNAV_SELECT_SURVEY_NAME').html(sHref);
	},
	showPopup : function (parentElement, popupHeader, popupText) {
		if (GNAV_SELECT.GNAV_SELECT_showPopup()) {
			if (GNAV_SELECT.hasPopup(parentElement)) {
				//console.log("updating popover");
				jQuery(parentElement).data('bs.popover').options.title = popupHeader;
				jQuery(parentElement).data('bs.popover').options.content = popupText;
			} else {
				//console.log("creating new popover");
				var cOpt = GNAV_SELECT.GNAV_SELECT_BS_Popover_options;
				cOpt.title = popupHeader;
				cOpt.content = popupText;
				jQuery(parentElement).popover(cOpt);
			}
            if(popupHeader!=popupText){jQuery(parentElement).popover('show');}
		} else {
			jQuery('.hasPopover').popover('destroy');
		}
	},
	hidePopup : function (parentElement) {
		jQuery(parentElement).popover('hide');
	},
	killPopup : function (parentElement) {
		jQuery(parentElement).removeClass('hasPopover');
		jQuery(parentElement).popover('destroy');
	},
	hasPopup : function (element) {
		if (jQuery(element).data("bs.popover")) {
			return true;
		}
		return false;
	},
    killAllPopups: function(){
        jQuery('.GNAV_SELECT_QELT').popover('destroy');
        jQuery('.GNAV_SELECT_res_li').popover('destroy');
    },
	scrollTo : function (parentElement, childElement) {
		if (parentElement) {
			var cSTop = jQuery(parentElement).scrollTop(); // current scrollTop
			var pTop = jQuery(parentElement).offset().top;
			var coTop = jQuery(childElement).offset().top;
			var pHeight = jQuery(parentElement).innerHeight();
			var cHeight = jQuery(childElement).outerHeight();
			var cBottom = coTop + cHeight;
			var pBottom = pTop + pHeight;
			var nSTop = cSTop + (cBottom - pBottom);
			if (cBottom > pBottom) {
				jQuery(parentElement).animate({
					scrollTop : nSTop
				}, 500, 'linear');
			}
		}
	},
	/***********************/
	/****** map stuff ******/
	/***********************/
	createMap : function () {
        if(GNAV_SELECT.GNAV_SELECT_leafletMap==0){
            var mapOpt = {
                center : [0, 0],
                zoom : 0,
                maxZoom : 4,
                zoomControl : false,
                dragging : true
            };
            GNAV_SELECT.GNAV_SELECT_leafletMap = L.map(GNAV_SELECT.GNAV_SELECT_mapDiv, mapOpt);
            L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
                noWrap : false
                //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(GNAV_SELECT.GNAV_SELECT_leafletMap);
        }
		GNAV_SELECT.hideMap();
	},
	hideMap : function () {
		jQuery(GNAV_SELECT.GNAV_SELECT_mapDiv).stop();
		jQuery(GNAV_SELECT.GNAV_SELECT_mapDiv).animate({
			opacity : 0,
			zIndex : -100
		}, 300);
        jQuery("#GNAV_SELECT_MAP_LINK").empty();
    },
	showMap : function (countryList) {
		// show the map with highlighted countries from an array of country-codes
		// add data to GNAV_SELECT.GNAV_SELECT_leafletMap
		// layer = GNAV_SELECT.GNAV_SELECT_JSON_LAYER
		if (!GNAV_SELECT.GNAV_SELECT_leafletMap) {
			return 1;
		}
		if (!GNAV_SELECT.GNAV_SELECT_mapJSON) {
			return 1;
		}
        GNAV_SELECT.setGenderCaseStudiesLink(countryList);
		GNAV_SELECT.GNAV_SELECT_leafletMap.invalidateSize();
		GNAV_SELECT.GNAV_SELECT_leafletMap.removeLayer(GNAV_SELECT.GNAV_SELECT_JSON_LAYER);
		var cGJSON = GNAV_SELECT.buildCountryJSON(countryList);
		var polyStyle = {
			stroke : false,
			color : "#999",
			weight : 1,
			fill : true,
			fillColor : 'blue',
			fillOpacity : 0.6
		};
		GNAV_SELECT.GNAV_SELECT_JSON_LAYER = L.geoJson(cGJSON, {
				style : polyStyle,
				onEachFeature : GNAV_SELECT.mapOnEachFT
			});
		GNAV_SELECT.GNAV_SELECT_JSON_LAYER.setStyle(polyStyle);
		GNAV_SELECT.GNAV_SELECT_JSON_LAYER.addTo(GNAV_SELECT.GNAV_SELECT_leafletMap);
		GNAV_SELECT.GNAV_SELECT_leafletMap.fitBounds(GNAV_SELECT.GNAV_SELECT_JSON_LAYER.getBounds(), {
			padding : [15, 15],
			animate : true,
			pan : {
				duration : 0.5
			}
		});
		jQuery(GNAV_SELECT.GNAV_SELECT_mapDiv).stop();
		jQuery(GNAV_SELECT.GNAV_SELECT_mapDiv).animate({
			opacity : 1,
			zIndex : 100
		}, 300);
	},
	mapOnEachFT : function (feature, layer) {
		layer.on('click', function () {
			var myISO3 = feature.properties.sov_a3;
			var myCountryArray = [myISO3];
			GNAV_SELECT.openGenderCaseStudies(myCountryArray);
			if (GNAV_SELECT.GNAV_SELECT_SHOW_MAP_ALERT) {
				alert(feature.properties.sov_a3);
			}
		});
	},
	openGenderCaseStudies : function (countryISO) {
		// works with an array
		// use GNAV_SELECT.GNAV_SELECT_URL_GENDER_CASE_STUDIES
		var selString = "#&country=";
		var i,
		iM = countryISO.length;
		for (i = 0; i < iM; i += 1) {
			selString += countryISO[i];
		}
		var fullURL = GNAV_SELECT.GNAV_SELECT_URL_GENDER_CASE_STUDIES + selString;
		window.open(fullURL, "_blank");
	},
	/*****************************/
	/****** selection stuff ******/
	/*****************************/
    updateSelection: function() {
        // target each checkbox.
        var allCB= jQuery('.GNAV_SELECT_QSEL');
        var resArray = [];
        var totList = [];
        var elemSel = {};
        var SID;
        var attrName, attrValue;
        jQuery(allCB).each(function(){
            // build structure like: [GNAV_SCAT, GNAV_DCAT, GNAV_YNQUESTION, GNAV_VALUE]
            if(jQuery(this).prop( "checked" )){
                elemSel = {};
                jQuery.each(this.attributes, function(i, attrib){
                         attrName = attrib.name;
                         attrValue = attrib.value;
                         if(attrName.substring(0,4)=='gnav'){
                            if(attrName.indexOf('_desc')==-1){elemSel[attrName]=attrValue;}
                         }
                    });
                totList.push(elemSel);
            }
        });
        GNAV_SELECT.updateHref(totList);
        
        //console.log(totList.length + " checkboxes checked ");
        // build array structure
        var i, iM = totList.length;
        var elem, tElem;
        for (i=0; i<iM; i+=1){
            tElem = [];
            elem = totList[i];
            if(elem.hasOwnProperty('gnav_scat') && elem.gnav_scat){ tElem[0]=elem.gnav_scat;} else{tElem[0]="";}
            if(elem.hasOwnProperty('gnav_dcat') && elem.gnav_dcat){ tElem[1]=elem.gnav_dcat;} else{tElem[1]="";}
            if(elem.hasOwnProperty('gnav_ynquestion') && elem.gnav_ynquestion){ tElem[2]=elem.gnav_ynquestion;} else{tElem[2]="";}
            if(elem.hasOwnProperty('gnav_value') && elem.gnav_value){ tElem[3]=elem.gnav_value;} else{tElem[3]="";}
            if(elem.hasOwnProperty('gnav_value_type') && elem.gnav_value_type){ tElem[4]=elem.gnav_value_type;} else{tElem[4]="";}
            resArray.push(tElem);
        }
		GNAV_SELECT.GNAV_SELECT_currentSelection=resArray;
		
        if(resArray.length==0){
			jQuery('.GNAV_SELECT_res_li').stop();
			jQuery('.GNAV_SELECT_res_li').slideDown("slow");
			
            //jQuery('.GNAV_SELECT_res_li').collapse('show');
            jQuery('h3#GNAV_SELECT_RES_H').html('Surveys');
            return;
        }
        var Q = d3_queue.queue()
            .defer(GNAV_SELECT.getMySelection, resArray)
            .await(function(error, data){
                if(error){throw error;}
				if(resArray!==GNAV_SELECT.GNAV_SELECT_currentSelection){
					return;
				}
                //console.log(data);
				jQuery('h3#GNAV_SELECT_RES_H').html('Surveys selected: ' + data.length);
                if(data.length==0){
                    //jQuery('.GNAV_SELECT_res_li').collapse('show');
					jQuery('.GNAV_SELECT_res_li').stop();
					jQuery('.GNAV_SELECT_res_li').slideDown();
					
                }
                else{
                    jQuery('.GNAV_SELECT_res_li').each(function(){
                        SID = jQuery(this).attr('sid');
                        if(data.indexOf(SID)==-1){
							jQuery(this).stop();
							jQuery(this).slideUp();
                            //jQuery(this).collapse('hide');
                        }
                        else{
                            //jQuery(this).collapse('show');
                            jQuery(this).stop();
							jQuery(this).slideDown("slow");
							
							if(data.length==1){
                                jQuery(this).trigger('click');
                            }
                        }
                    });
                }
            });
    },
	showSelectionReason : function (surveyID, sVersion) {
		var tresList = [];
		var resList = [];
        var cObject;
		var cData;
		var sCat, dCat, sVal, YNQ;
		var i, iM;
		var r, rM;
		var oElement;
        var selectElement, selectCB;
        var cSelectStruct;
		jQuery('li.GNAV_SELECT_lh').removeClass('highlight');
		var q = d3_queue.queue(1)
			.defer(GNAV_SELECT.getSurveyScores, surveyID, sVersion)
			.await(function (error, surveyScores) {
				if (error) {throw error;} 
                else {
                    rM=surveyScores.length;
                    for(r=0;r<rM; r+=1){
                        if(surveyScores[r].hasOwnProperty('GNAV_DCAT') && surveyScores[r].GNAV_DCAT){
                            if(surveyScores[r].hasOwnProperty('GNAV_YNQUESTION') && surveyScores[r].GNAV_YNQUESTION){
                                selectElement=jQuery('.GNAV_SELECT_QEL[gnav_scat="' + surveyScores[r].GNAV_SCAT + '"][gnav_dcat="' + surveyScores[r].GNAV_DCAT + '"][gnav_ynquestion="'+surveyScores[r].GNAV_YNQUESTION+'"][gnav_value="' + surveyScores[r].GNAV_VALUE + '"]');
                                selectCB=jQuery(selectElement).find('input.GNAV_SELECT_QSEL');
                                if(jQuery(selectCB).prop('checked')){
                                    jQuery(selectElement).addClass('highlight');
                                    resList.push(surveyScores[r]);
                                }
                            }
                            else{
                                selectElement=jQuery('.GNAV_SELECT_QEL[gnav_scat="' + surveyScores[r].GNAV_SCAT + '"][gnav_dcat="' + surveyScores[r].GNAV_DCAT + '"][gnav_value="' + surveyScores[r].GNAV_VALUE + '"]');
                                selectCB=jQuery(selectElement).find('input.GNAV_SELECT_QSEL');
                                if(jQuery(selectCB).prop('checked')){
                                    jQuery(selectElement).addClass('highlight');
                                    resList.push(surveyScores[r]);
                                }
                            }
                        }
                        else{
                            selectElement=jQuery('.GNAV_SELECT_QEL[gnav_scat="' + surveyScores[r].GNAV_SCAT + '"][gnav_value="' + surveyScores[r].GNAV_VALUE + '"]');
                            selectCB=jQuery(selectElement).find('input.GNAV_SELECT_QSEL');
                            if(jQuery(selectCB).prop('checked')){
                                jQuery(selectElement).addClass('highlight');
                                resList.push(surveyScores[r]);
                            }
                        }
                    }
					rM = resList.length;
					/*
					if (rM > 0) {
                        cSelectStruct = GNAV_SELECT.buildSelectStruct(resList);
						oElement = jQuery('.GNAV_SELECT_res_li[sid="' + surveyID + '"]');
						GNAV_SELECT.showPopup(oElement, "Selected because: ", cSelectStruct.outerHTML);
					}
                    else{
                        oElement = jQuery('.GNAV_SELECT_res_li[sid="' + surveyID + '"]');
                        GNAV_SELECT.killPopup(oElement);
                    }
					*/
				}
			});
	},
	clearSelection : function () {
		// remove all selections made in the selector
		// update selector
		jQuery('.GNAV_SELECT_QSEL').prop('checked', false);
		jQuery('.GNAV_SELECT_selectAll').prop('checked', false);
		jQuery('.GNAV_SELECT_selectAll').prop('indeterminate', false);
        jQuery('.GNAV_SELECT_valElement').remove();
        jQuery('.hasSelection').removeClass('hasSelection'); 
		GNAV_SELECT.GNAV_SELECT_currentSelection=0;
		GNAV_SELECT.updateSelection();
		GNAV_SELECT.collapseSelector();
		GNAV_SELECT.clearSurveyInfo();
	},
	updateHref : function (sel) {
		//var sel = GNAV_SELECT.computeSelection();
		var siteURL = window.location.href;
		var lPos = siteURL.indexOf(GNAV_SELECT.GNAV_SELECT_URL_LString);
        if(sel){
            var updString = JSON.stringify(sel);
			if (lPos == -1) {
				window.location.href = window.location.href + GNAV_SELECT.GNAV_SELECT_URL_LString + ":" + updString;
			} else {
				window.location.href = window.location.href.substring(0, lPos) + GNAV_SELECT.GNAV_SELECT_URL_LString + ":" + updString;
			}
        }
        else{
            if (lPos > -1) {
                window.location.href = window.location.href.substring(0, lPos);
            }
        }
        
	},
	updateFromHref : function () {
		var siteURL = window.location.href;
		var lPos = siteURL.indexOf(GNAV_SELECT.GNAV_SELECT_URL_LString);
		var selArray;
		if (lPos == -1) {
			return;
		}
        var GNAV_VALUE, GNAV_SCAT, GNAV_DCAT, GNAV_YNQUESTION;
		var selString = siteURL.substring(lPos + GNAV_SELECT.GNAV_SELECT_URL_LString.length);
		var colonPos = selString.indexOf(":"); // strip colon
        var i, iM;
        var selectElement;
		var selectParents;
		selString = selString.substring(colonPos + 1);
		selString = selString.trim(); //strip leading/trailing whitespace
		selString = decodeURIComponent(selString);
        try{
            selArray = JSON.parse(selString);
        }catch(e){
            GNAV_SELECT.updateHref();
            return;
        }
        if(selArray){
            iM = selArray.length;
            for (i = 0; i < iM; i += 1) {
                GNAV_VALUE="";
                GNAV_SCAT="";
                GNAV_DCAT="";
                GNAV_YNQUESTION="";
                selectElement=null;
                
                if(selArray[i].hasOwnProperty('gnav_value') && selArray[i].gnav_value){GNAV_VALUE=selArray[i].gnav_value;}
                if(selArray[i].hasOwnProperty('gnav_scat') && selArray[i].gnav_scat){GNAV_SCAT=selArray[i].gnav_scat;}
                if(selArray[i].hasOwnProperty('gnav_dcat') && selArray[i].gnav_dcat){GNAV_DCAT=selArray[i].gnav_dcat;}
                if(selArray[i].hasOwnProperty('gnav_ynquestion') && selArray[i].gnav_ynquestion){GNAV_YNQUESTION=selArray[i].gnav_ynquestion;}
                if(GNAV_DCAT!=""){
                    if(GNAV_YNQUESTION!=""){
                        selectElement=jQuery('.GNAV_SELECT_QSEL[gnav_scat="' + GNAV_SCAT + '"][gnav_dcat="' + GNAV_DCAT + '"][gnav_ynquestion="'+GNAV_YNQUESTION+'"][gnav_value="' + GNAV_VALUE + '"]');
                    }
                    else{
                        selectElement=jQuery('.GNAV_SELECT_QSEL[gnav_scat="' + GNAV_SCAT + '"][gnav_dcat="' + GNAV_DCAT + '"][gnav_value="' + GNAV_VALUE + '"]');
                    }
                }
                else{
                    selectElement=jQuery('.GNAV_SELECT_QSEL[gnav_scat="' + GNAV_SCAT + '"][gnav_value="' + GNAV_VALUE + '"]');
                }
                if(selectElement && selectElement.length>0){
                        jQuery(selectElement).prop("checked", true);
						selectParents = jQuery(selectElement).parents('.GNAV_SELECT_ULITEM'); //.collapse('show');
						jQuery(selectParents).each(function(){GNAV_SELECT.jCollapse(this);});
                    }
            }
        }
        GNAV_SELECT.updateSelection();
	},
	lookupHeader : function (hArray, hID) {
		var i,
		iM = hArray.length;
		for (i = 0; i < iM; i += 1) {
			if (hArray[i].hasOwnProperty("hID")) {
				if (hArray[i].hID == hID) {
					return i;
				}
			}
		}
		return -1;
	},
	buildSelectStruct : function (resList) {
		var resDiv = document.createElement('div');
		var headers = [];
		var hElem = {
			"hID" : 0,
			"hName" : "",
			"hValueElements" : []
		};
		var r,
		rM = resList.length;
		var t,
		tM;
		var sC_Parents,
		hParent,
		hIndex;
		var cDiv,
		hDiv,
		eDiv,
		eSpan;
		var e,
		eM;
		var cCat,
		sVal,
		dCat;
		var pCat;
		var cSentence;
        var sCat;
		if (rM > 0) {
			for (r = 0; r < rM; r += 1) {
				sCat = resList[r].GNAV_SCAT;
				sC_Parents = GNAV_SELECT.getParentCats(sCat);
				sC_Parents.unshift(sCat);
				hParent = sC_Parents[sC_Parents.length - 3]; //just below root
				hIndex = GNAV_SELECT.lookupHeader(headers, hParent);
				pCat = GNAV_SELECT.getCatByID(hParent);
				if (hIndex == -1) {
					hElem = {
						"hID" : hParent,
						"hOrder" : pCat.GNAV_SORDER,
						"hName" : pCat.GNAV_DESCRIPTION,
						"hValueElements" : [resList[r]]
					};
					headers.push(hElem);
				} else {
					headers[hIndex].hValueElements.push(resList[r]);
				}
			}
			// sort headers by hOrder;
			headers.sort(GNAV_SELECT.sortPOHStruct);
			// build actual strings
			tM = headers.length;
			for (t = 0; t < tM; t += 1) {
				cDiv = document.createElement('div');
				jQuery(cDiv).addClass('GNAV_SELECT_PO_EL');
				hDiv = document.createElement('div');
				jQuery(hDiv).addClass('GNAV_SELECT_PO_HEADER');
				jQuery(hDiv).text(headers[t].hName);
				jQuery(cDiv).append(hDiv);
				eM = headers[t].hValueElements.length;
				for (e = 0; e < eM; e += 1) {
					eDiv = document.createElement('div');
					jQuery(eDiv).addClass('GNAV_SELECT_PO_VAL');
					// gnav_scat
					if (headers[t].hID != headers[t].hValueElements[e][0]) {
						eSpan = document.createElement('span');
						jQuery(eSpan).addClass('GNAV_SELECT_PO_VAL_ITEM');
                        //console.log(headers[t].hValueElements[e]);
						cCat = GNAV_SELECT.capFirstLetter(GNAV_SELECT.getCatNamebyID(headers[t].hValueElements[e].GNAV_SCAT));
						cSentence = GNAV_SELECT.shortenSentence(cCat, 3, 6) + ": ";
						jQuery(eSpan).text(cSentence);
						jQuery(eDiv).append(eSpan);
					}
					// dCat
					dCat = headers[t].hValueElements[e].GNAV_DCAT;
					if (dCat) {
						if (dCat == 'Question/Response Type') {
							cSentence = 'QR type: ';
						} else if (dCat == 'Respondent') {
							cSentence = 'Resp.: ';
						} else if (dCat == 'Sex disaggregated') {
							cSentence = 'Sex dis.: ';
						} else {
							cSentence = dCat.substr(0, 20) + ": ";
						}
						eSpan = document.createElement('span');
						jQuery(eSpan).addClass('GNAV_SELECT_PO_VAL_ITEM');
						jQuery(eSpan).text(cSentence);
						jQuery(eDiv).append(eSpan);
					}
					// sVal
					sVal = headers[t].hValueElements[e].GNAV_VALUE;
					cSentence = GNAV_SELECT.shortenSentence(sVal, 4, 6);
					eSpan = document.createElement('span');
					jQuery(eSpan).addClass('GNAV_SELECT_PO_VAL_ITEM');
					jQuery(eSpan).addClass('GNAV_SELECT_PO_VALUE');
					jQuery(eSpan).text(cSentence);
					jQuery(eDiv).append(eSpan);
					jQuery(cDiv).append(eDiv);
				}
				jQuery(resDiv).append(cDiv);
			}
		}
		return resDiv;
	},
	/*****************************/
	/*** data lookup functions ***/
	/*****************************/
    getMyDataCatOrder: function(DCat){
        var i, iM=GNAV_SELECT.GNAV_SELECT_DataCatOrder.length;
        for (i=0; i<iM; i+=1){
            if (GNAV_SELECT.GNAV_SELECT_DataCatOrder[i].hasOwnProperty('GNAV_VALUE') && GNAV_SELECT.GNAV_SELECT_DataCatOrder[i].GNAV_VALUE==DCat){
                return GNAV_SELECT.GNAV_SELECT_DataCatOrder[i].GNAV_SORDER;
            }
        }
        return -1;
    },
    guid: function(){
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    },
    checkedCount: function(ctrl_ID){
        var res = [0,0];
        var cb = jQuery('input.GNAV_SELECT_QSEL');
        var cb_parent_ul, cb_parent_ul_ctrl;
        jQuery(cb).each(function(){
            cb_parent_ul=jQuery(this).parents('.GNAV_SELECT_ULITEM').first();
            cb_parent_ul_ctrl=jQuery(cb_parent_ul).attr('gnav_ctrlby');
            if(cb_parent_ul_ctrl==ctrl_ID){
                res[1]+=1;
                if (jQuery(this).prop('checked')){res[0]+=1;}
        }
        });
        return res;
    },                
    checkedCount_old : function (sID) {
		return jQuery('input.GNAV_SELECT_checkBox[scorecat="' + sID + '"]:checked').length;
	},
    getMyValues: function(CATID, DCAT, GNAV_YNQUESTION){
        var res=[];
        var GS;
        var GClone;
        var i, iM = GNAV_SELECT.GNAV_SELECT_scoreData.length;
        for (i=0; i<iM; i+=1){
            GS = GNAV_SELECT.GNAV_SELECT_scoreData[i];
            if(GS.GNAV_SCAT==CATID){
                if(GS.hasOwnProperty('GNAV_DCAT') && GS.GNAV_DCAT==DCAT){
                    if(GS.GNAV_YNQUESTION){
                        if(GS.GNAV_YNQUESTION==GNAV_YNQUESTION){
                            GClone=GNAV_SELECT.getObjectClone(GS);
                            res.push(GClone);
                        }
                    }
                    else{
                        GClone=GNAV_SELECT.getObjectClone(GS);
                        res.push(GClone);
                    }
                }
                else if(GS.hasOwnProperty('GNAV_DCAT') && !GS.GNAV_DCAT && DCAT==""){
                    GClone=GNAV_SELECT.getObjectClone(GS);
                    res.push(GClone);
                }
            }
        }
        return res.sort(GNAV_SELECT.sortValues);
    },
    getMyYNQuestion: function(CATID, YNQ){
        var i, iM = GNAV_SELECT.GNAV_SELECT_scoreData.length;
        var GSC, GQ;
        for (i=0; i<iM; i+=1){
            if(GNAV_SELECT.GNAV_SELECT_scoreData[i].hasOwnProperty('GNAV_YNQUESTION') && GNAV_SELECT.GNAV_SELECT_scoreData[i].GNAV_YNQUESTION){
                if(GNAV_SELECT.GNAV_SELECT_scoreData[i].hasOwnProperty('GNAV_SCAT') && GNAV_SELECT.GNAV_SELECT_scoreData[i].GNAV_SCAT){
                    GSC = GNAV_SELECT.GNAV_SELECT_scoreData[i].GNAV_SCAT;
                    GQ = GNAV_SELECT.GNAV_SELECT_scoreData[i].GNAV_YNQUESTION;
                    if(GSC==CATID && GQ==YNQ){
                        return GNAV_SELECT.GNAV_SELECT_scoreData[i].GNAV_YNQUESTION_DESC;
                    }
                }
            }
        }
        return false;
    },
    getMyDataCats: function(CATID){
        var res=[];
        var YNQ=[];
        var DC=[];
        var GS;
        var i, iM = GNAV_SELECT.GNAV_SELECT_scoreData.length;
        for (i=0; i<iM; i+=1){
            GS = GNAV_SELECT.GNAV_SELECT_scoreData[i];
            if(GS.GNAV_SCAT==CATID){
                if(GS.hasOwnProperty('GNAV_DCAT') && GS.GNAV_DCAT){
                    if(GS.hasOwnProperty('GNAV_YNQUESTION') && GS.GNAV_YNQUESTION){
                        if(YNQ.indexOf(GS.GNAV_YNQUESTION)==-1){
                            res.push([GS.GNAV_DCAT, GS.GNAV_YNQUESTION]);
                            YNQ.push(GS.GNAV_YNQUESTION);
                        }
                    }
                    else{
                        if(DC.indexOf(GS.GNAV_DCAT)==-1){
                            res.push([GS.GNAV_DCAT, ""]);
                            DC.push(GS.GNAV_DCAT);
                        }
                    }
                }
            }
        }
        //console.log("getMyDataCats: " + res.length + " " + CATID);
        return res.sort(GNAV_SELECT.sortDCats);
    },
    getMetaDef : function (metaCat) {
        var i, iM= GNAV_SELECT.GNAV_SELECT_MetaCatDefs.length;
        for (i = 0; i < iM; i += 1) {
            if(GNAV_SELECT.GNAV_SELECT_MetaCatDefs[i].hasOwnProperty('GNAV_VALUE') && GNAV_SELECT.GNAV_SELECT_MetaCatDefs[i].GNAV_VALUE==metaCat){
                return GNAV_SELECT.GNAV_SELECT_MetaCatDefs[i].GNAV_DESCRIPTION;
            }
        }
        return metaCat;
    },
	getCatByID : function (catID) {
		var i,
		iM = GNAV_SELECT.GNAV_SELECT_selectorData.length;
		for (i = 0; i < iM; i += 1) {
            if(GNAV_SELECT.GNAV_SELECT_selectorData[i].hasOwnProperty("SCORE_CATEGORY") && GNAV_SELECT.GNAV_SELECT_selectorData[i].SCORE_CATEGORY ==catID){
                return GNAV_SELECT.GNAV_SELECT_selectorData[i];
            }
		}
		return -1;
	},
	getIDbyName : function (catName) {
		var i,
		iM = GNAV_SELECT.GNAV_SELECT_selectorData.length;
		for (i = 0; i < iM; i += 1) {
            if(GNAV_SELECT.GNAV_SELECT_selectorData[i].hasOwnProperty('GNAV_DESCRIPTION') && GNAV_SELECT.GNAV_SELECT_selectorData[i].GNAV_DESCRIPTION == catName){
                return GNAV_SELECT.GNAV_SELECT_selectorData[i].GNAV_SCAT;
            }
            /*
			if (GNAV_SELECT.GNAV_SELECT_selectorData[i][1] == catName) {
				return GNAV_SELECT.GNAV_SELECT_selectorData[i].;
			}
            */
		}
		return 0;
	},
	getCatNamebyID : function (catID) {
		var i,
		iM = GNAV_SELECT.GNAV_SELECT_selectorData.length;
		for (i = 0; i < iM; i += 1) {
			if(GNAV_SELECT.GNAV_SELECT_selectorData[i].hasOwnProperty("GNAV_SCAT") && GNAV_SELECT.GNAV_SELECT_selectorData[i].GNAV_SCAT ==catID){
				return GNAV_SELECT.GNAV_SELECT_selectorData[i].GNAV_DESCRIPTION;
			}
		}
		return "unknown";
	},
	getValDispNamebyID : function (scoreVal) {
		var i,
		iM = GNAV_SELECT.GNAV_SELECT_scoreData.length;
		for (i = 0; i < iM; i += 1) {
			if (GNAV_SELECT.GNAV_SELECT_scoreData[i].hasOwnProperty('GNAV_VALUE') && GNAV_SELECT.GNAV_SELECT_scoreData[i].GNAV_VALUE == scoreVal && GNAV_SELECT.GNAV_SELECT_scoreData[i].GNAV_VALUE_TYPE=='scoreValue') {
				return GNAV_SELECT.GNAV_SELECT_scoreData[i].GNAV_DESCRIPTION;
			}
		}
		return 0;
	},
	getChildren : function (selectID){ 
		var res = [];
		var i, iM = GNAV_SELECT.GNAV_SELECT_selectorData.length;
		for (i = 0; i < iM; i += 1) {
           if(GNAV_SELECT.GNAV_SELECT_selectorData[i].hasOwnProperty('SCORE_PARENT') && GNAV_SELECT.GNAV_SELECT_selectorData[i].SCORE_PARENT == selectID){
				res.push(GNAV_SELECT.GNAV_SELECT_selectorData[i]);
			}
		}
		return res.sort(GNAV_SELECT.sortByID_Name);
	},
	getValues : function (elemID, callback) {
        /*
        GNAV_DCAT : "Question Response Type"
        GNAV_DESCRIPTION : "Respondent(s) asked who has certain rights and responsibilities. Question responses allow for at least one person ID code or other identifying information or are linked to this information through the plot ID, livestock ID, enterprise ID, etc."
        GNAV_MCAT : null
        GNAV_SCAT : "1381152728"
        GNAV_VALUE: "1"
        GNAV_VALUE_TYPE : "scoreValue"
        */
		var res = [];
		var i, iM = GNAV_SELECT.GNAV_SELECT_scoreData.length;
        var GClone;
		for (i = 0; i < iM; i += 1) {
            if(GNAV_SELECT.GNAV_SELECT_scoreData[i].hasOwnProperty('GNAV_SCAT')){
                if(parseInt(GNAV_SELECT.GNAV_SELECT_scoreData[i].GNAV_SCAT,10)==elemID){
                    GClone=GNAV_SELECT.getObjectClone(GNAV_SELECT.GNAV_SELECT_scoreData[i]);
                    res.push(GClone);
                }
            }
		}
        //console.log('getValues: ' + elemID + " of " + iM)
        //console.log(res);
		callback(null, res.sort(GNAV_SELECT.SortValues));
	},
    getObjectClone: function(jObject){
        var key;
        var cloneObject={};
        for (key in jObject){
            if (jObject.hasOwnProperty(key)){
                cloneObject[key]=jObject[key];
            }
        }
        return cloneObject;
    },
	getScoreDescription : function (gnav_scat, gnav_dcat) {
		var i,
		iM = GNAV_SELECT.GNAV_SELECT_ScoreDefs.length;
		var cSC,
		cSD;
		for (i = 0; i < iM; i += 1) {
			cSC = GNAV_SELECT.GNAV_SELECT_ScoreDefs[i].GNAV_VALUE;
			cSD = GNAV_SELECT.GNAV_SELECT_ScoreDefs[i].GNAV_VALUE_SUBTYPE;
			if (cSC == gnav_scat && cSD == gnav_dcat) {
				return GNAV_SELECT.GNAV_SELECT_ScoreDefs[i].GNAV_DESCRIPTION;
			} else if (cSC == gnav_scat && (!cSD && !gnav_dcat)) {
				return GNAV_SELECT.GNAV_SELECT_ScoreDefs[i].GNAV_DESCRIPTION;
			}
		}
		return ("unknown");
	},
	getControlID : function (element) {
		var attr = jQuery(element).attr('GNAV_SELECT_control_id');
		if (typeof attr !== typeof undefined && attr !== false) {
			return attr;
		}
		return false;
	},
	getControlledByID : function (element) {
		var attr = jQuery(element).attr('GNAV_SELECT_controlled_by');
		if (typeof attr !== typeof undefined && attr !== false) {
			return attr;
		}
		return false;
	},
	getParentCats : function (gnav_scat) {
		// get all the parents in GNAV_SELECT.selectorData
		//[c_ID, c_Name, c_Parent]
		var res = [];
		var i,
		iM;
		var myParent,
		tParents;
		var myElem = GNAV_SELECT.getElementByScoreCat(gnav_scat);
		if (myElem != undefined) {
			myParent = String(myElem.SCORE_PARENT);
			res.push(myParent);
			tParents = GNAV_SELECT.getParentCats(myParent);
			iM = tParents.length;
			if (iM >= 0) {
				for (i = 0; i < iM; i += 1) {
					res.push(String(tParents[i]));
				}
			}
		}
		return res;
	},
	getElementByScoreCat : function (gnav_scat) {
		var i,
		iM = GNAV_SELECT.GNAV_SELECT_selectorData.length;
		for (i = 0; i < iM; i += 1) {
            if(GNAV_SELECT.GNAV_SELECT_selectorData[i].hasOwnProperty('SCORE_CATEGORY') && GNAV_SELECT.GNAV_SELECT_selectorData[i].SCORE_CATEGORY==gnav_scat){
                return GNAV_SELECT.GNAV_SELECT_selectorData[i];
            }
		}
	},
	scoreCatInResArray : function (resArray, gnav_scat) {
		var i;
		var ral = resArray.length;
		for (i = 0; i < ral; i += 1) {
			if (resArray[i][0] == gnav_scat) {
				return i;
			}
		}
		return -1;
	},
	computeSelection : function () {
		// create an array of selection:
		//[[scorecat, [[datacat,scoreVal], [datacat,scoreVal]]], [scorecat, [[datacat,scoreVal]]]
		var res = [];
		var sIndex;
		jQuery('.GNAV_SELECT_checkBox').each(function () {
			if (this.checked) {
				var sCat = jQuery(this).attr('gnav_scat');
				var sVal = jQuery(this).attr('gnav_value');
				var dCat = jQuery(this).attr('gnav_dcat');
				if (!dCat) {
					dCat = "";
				}
				// check if scoreCat already in resArray
				sIndex = GNAV_SELECT.scoreCatInResArray(res, sCat);
				if (sIndex == -1) {
					// create full element
					var tElem = [sCat, [
							[dCat, sVal]
						]];
					res.push(tElem);
				} else {
					res[sIndex][1].push([dCat, sVal]);
				}
			}
		});
		return res;
	},
	surveyInResultArray : function (resArray, surveyID) {
		var i,
		ral = resArray.length;
		for (i = 0; i < ral; i += 1) {
            if(resArray[i].hasOwnProperty('SID') && (parseInt(surveyID, 10) == parseInt(resArray[i].SID,10))){
				return i;
			}
		}
		return -1;
	},
	getSurveyNameByID : function (surveyID) {
		var i;
		var m = GNAV_SELECT.GNAV_SELECT_allSurveys.length;
		for (i = 0; i < m; i += 1) {
            if(GNAV_SELECT.GNAV_SELECT_allSurveys[i].hasOwnProperty("SID") && GNAV_SELECT.GNAV_SELECT_allSurveys[i].SID == surveyID){
                return GNAV_SELECT.GNAV_SELECT_allSurveys[i].GNAV_VALUE;
            }
		}
		return "unknown survey";
	},
	getElementFromNestedArray : function (inArray, searchValue, arrayIndex) {
		var i;
		var al = inArray.length;
		for (i = 0; i < al; i += 1) {
			if (inArray[i][arrayIndex] == searchValue) {
				return i;
			}
		}
		return -1;
	},
	subArrayInArray : function (sArray, fArray) {
		var i,
		iM = fArray.length;
		var y,
		yM = sArray.length;
		var tScore;
		for (i = 0; i < iM; i += 1) {
			tScore = 0;
			for (y = 0; y < yM; y += 1) {
				if (fArray[i][y] == String(sArray[y])) {
					tScore += 1;
				} else if (!fArray[i][y] && !sArray[y]) {
					tScore += 1;
				}
			}
			if (tScore == yM) {
				return i;
			}
		}
		return -1;
	},
	buildCountryJSON : function (countryList) {
		var i,
		iM = GNAV_SELECT.GNAV_SELECT_mapJSON.features.length;
		var resObj = {
			"type" : "FeatureCollection",
			"features" : []
		};
		var cA3;
		for (i = 0; i < iM; i += 1) {
			cA3 = GNAV_SELECT.GNAV_SELECT_mapJSON.features[i].properties.sov_a3;
			if (countryList.indexOf(cA3) > -1) {
				resObj.features.push(GNAV_SELECT.GNAV_SELECT_mapJSON.features[i]);
			}
		}
		return (resObj);
	},
	getAllValueDefs: function(gnav_dcat){
		var i, iM=GNAV_SELECT.GNAV_SELECT_AllDefs.length;
		var vItem;
		var resList = [];
		for(i=0; i<iM; i+=1){
			vItem= GNAV_SELECT.GNAV_SELECT_AllDefs[i];
			if(vItem.hasOwnProperty('GNAV_CATEGORY') && vItem.GNAV_CATEGORY=="GNAV_VALUE"){
				if(vItem.hasOwnProperty('GNAV_VALUE_TYPE') && vItem.GNAV_VALUE_TYPE==gnav_dcat){
					resList.push(vItem);
				}
			}
		}
		return resList;
				

	},	
	/****************************/
	/******** SORT STUFF ********/
	/****************************/
	setDisplayOrder: function(data) {
        //GNAV_DATA_TYPE, GNAV_VALUE, GNAV_SORDER
        GNAV_SELECT.GNAV_SELECT_DataCatOrder=[];
        GNAV_SELECT.GNAV_SELECT_MetaCatOrder=[];
        GNAV_SELECT.GNAV_SELECT_ScoreCatOrder=[];
        var i, iM= data.length;
        for(i=0; i<iM; i+=1){
            if(data[i].hasOwnProperty('GNAV_DATA_TYPE') && data[i].GNAV_DATA_TYPE){
                if (data[i].GNAV_DATA_TYPE=="GNAV_SCAT"){GNAV_SELECT.GNAV_SELECT_ScoreCatOrder.push(data[i]);}
                if (data[i].GNAV_DATA_TYPE=="GNAV_DCAT"){GNAV_SELECT.GNAV_SELECT_DataCatOrder.push(data[i]);}
                if (data[i].GNAV_DATA_TYPE=="GNAV_MCAT"){GNAV_SELECT.GNAV_SELECT_MetaCatOrder.push(data[i]);}
            }
        }
        GNAV_SELECT.GNAV_SELECT_DataCatOrder.sort(GNAV_SELECT.sortByOrder);
        GNAV_SELECT.GNAV_SELECT_MetaCatOrder.sort(GNAV_SELECT.sortByOrder);
        GNAV_SELECT.GNAV_SELECT_ScoreCatOrder.sort(GNAV_SELECT.sortByOrder);
    },
	sortByOrder: function(a,b){
        if(a.hasOwnProperty('GNAV_SORDER') && b.hasOwnProperty('GNAV_SORDER')){
            return a.GNAV_SORDER-b.GNAV_SORDER;
        }
        return 0;
    },
    sortValues: function(a,b){
        if(a.hasOwnProperty('GNAV_VALUE') && b.hasOwnProperty('GNAV_VALUE')){
            return GNAV_SELECT.sortByString(a.GNAV_VALUE, b.GNAV_VALUE);
        }
        return 0;
    },
    sortDCats: function(a,b){
        var aDCAT, bDCAT;
        var aO, bO;
        aDCAT=a[0];
        bDCAT=b[0];
        if(aDCAT==bDCAT){return 0;}
        aO=GNAV_SELECT.getMyDataCatOrder(aDCAT);
        bO=GNAV_SELECT.getMyDataCatOrder(bDCAT);
        return aO-bO;
    },
    sortByID_Name : function (a, b) {
        if(a.hasOwnProperty('GNAV_SORDER') && b.hasOwnProperty('GNAV_SORDER')){
            if(a.GNAV_SORDER == b.GNAV_SORDER){
                if(a.hasOwnProperty('GNAV_DESCRIPTION') && b.hasOwnProperty('GNAV_DESCRIPTION')){
                    if (a.GNAV_DESCRIPTION !=null && b.GNAV_DESCRIPTION !=null){
                        return GNAV_SELECT.sortByString(a.GNAV_DESCRIPTION, b.GNAV_DESCRIPTION);
                    }
                    else{
                        if (a.hasOwnProperty('SVal') && a.SVal!=null && b.hasOwnProperty('SVal') && b.SVal!=null){
                            return GNAV_SELECT.sortByString(a.SVal, b.SVal);
                        }
                    }
                }
                else{
                    return 0;
                }
            }
            else{
                return GNAV_SELECT.sortByNum(a.GNAV_SORDER,b.GNAV_SORDER);
            }
        }
        return 0;
    },
    sortByNum : function (a, b) {
		return a - b;
	},
	sortByString : function (a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	},
	sortPOHStruct : function (a, b) {
		if (a.hasOwnProperty("hOrder") && b.hasOwnProperty("hOrder")) {
			return a.hOrder - b.hOrder;
		}
		return 0;
	},
	/*************************************/
	/******** STRING MANIPULATION ********/
	/*************************************/
	capFirstLetter : function (inString) {
		return inString.charAt(0).toUpperCase() + inString.slice(1);
	},
	shortenSentence : function (inString, maxWords, maxWordLength) {
		var words = String(inString).split(" ");
		var i;
		var resSent = "";
		if (inString.length < (maxWords * maxWordLength)) {
			return inString;
		}
		var iM = (words.length > maxWords) ? maxWords : words.length;
		for (i = 0; i < iM; i += 1) {
			if (i == 0) {
				resSent += (words[i] + " ");
			} else if (words[i].length > maxWordLength) {
				resSent += (words[i].substr(0, maxWordLength - 1) + ". ");
			} else {
				resSent += (words[i] + " ");
			}
		}
		if (words.length > maxWords) {
			resSent += "..";
		}
		return resSent;
	},
    isURL: function(inString){
        var pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", "i");
        /*
        var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
        '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
        '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
        '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
        '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
        '(\#[-a-z\d_]*)?$','i'); // fragment locater
        */
        if(!pattern.test(inString)) {
            return false;
        } 
        else {
            return true;
        }
    },
	shortString: function(instring, maxlen){
        var tArr, i, iM, resString;
        var shLen;
        resString=instring;
        if(instring.length>maxlen){
            // see if contains spaces
            if(instring.indexOf(' ')>0){
                resString='';
                tArr = instring.split(' ');
                iM=tArr.length;
                shLen = Math.floor((maxlen/iM)-2);
                if(shLen<1){shLen=1;}
                for (i=0;i<iM; i+=1){
                    resString+=tArr[i].substring(0,shLen);
                    resString+='. ';
                    if(resString.length>=maxlen){
                        return resString;
                    }
                }
            }
            else{
                resString=instring.substring(0,maxlen-1);
                resString+=".";
                return resString;
            }
        }
        return resString;
    },
    /****************************/
	/*******  AJAX STUFF ********/
	/****************************/
	getAllScores : function (callback) {
		GNAV_MAIN.showStatusMessage("getting all the scores");
		jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
			'GNAV_SELECT_AllScores' : 1,
			'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			GNAV_MAIN.showStatusMessage("got all the scores");
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_MAIN.showStatusMessage("failed getting all the scores....");
			GNAV_SELECT.failRequest("getAllScores", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
	getAllSurveys : function (callback) {
		GNAV_MAIN.showStatusMessage("getting all the surveys");
		jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
            'GNAV_SELECT_allSurvey' : 'all',
            'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			GNAV_MAIN.showStatusMessage("got all the surveys");
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_MAIN.showStatusMessage("error getting all the surveys");
			GNAV_SELECT.failRequest("getAllSurveys", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
    getDisplayOrder: function(callback){
		GNAV_MAIN.showStatusMessage("getting the display order");
        jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
            'GNAV_SELECT_DisplayOrder' : 1,
            'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			GNAV_MAIN.showStatusMessage("got the display order");
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_SELECT.failRequest("getDisplayOrder", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
	getGeoJSON : function (callback) {
		jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
			'GNAV_SELECT_getGEO_JSON' : 1,
			'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_SELECT.failRequest("getGeoJSON", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
	getScoreDefs : function (callback) {
		GNAV_MAIN.showStatusMessage("getting the score definitions");
		jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
			'GNAV_admin_getScoreDefs' : 1,
			'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			GNAV_MAIN.showStatusMessage("got the score definitions");
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_SELECT.failRequest("getScoreDefs", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
    getMetaCatDefs: function (callback){
        jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
			'GNAV_SELECT_getMetaDefs' : 1,
			'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_SELECT.failRequest("getMetaCatDefs", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
	getCategories : function (callback) {
		GNAV_MAIN.showStatusMessage("getting the score categories");
		jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
			'GNAV_SELECT_totalTree' : 1,
			'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			GNAV_MAIN.showStatusMessage("got the score categories");
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_SELECT.failRequest("getCategories", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
    getMySelection: function(selectionArray, callback){
        var mySelection = JSON.stringify(selectionArray);
        jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
			'GNAV_SELECT_SELECTION' : mySelection,
			'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_SELECT.failRequest("getMySelection", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
	getSurveyMetaData : function (surveyID, sVersion, callback) {
		jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
			'GNAV_SELECT_surveyMetaValues' : surveyID,
            'GNAV_SURVEY_VERSION': sVersion,
			'security' : GNAV_admin_local.ajax_nonce
		}) 
		.done(function (data) {
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_SELECT.failRequest("getSurveyMetaData", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
	getSurveyScores : function (surveyID, sVersion, callback) {
		//check/build cache
		var i,
		iM = GNAV_SELECT.GNAV_SELECT_surveyScoreCache.csvs.length;
		for (i = 0; i < iM; i += 1) {
			if (GNAV_SELECT.GNAV_SELECT_surveyScoreCache.csvs[i].hasOwnProperty('surveyID')) {
				if (String(GNAV_SELECT.GNAV_SELECT_surveyScoreCache.csvs[i].surveyID) == String(surveyID)) {
					callback(null, GNAV_SELECT.GNAV_SELECT_surveyScoreCache.csvs[i].surveyMData);
					return;
				}
			}
		}
		jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
			'GNAV_admin_allSurveyValues' : surveyID,
            'GNAV_admin_sVersion': sVersion,
			'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			GNAV_SELECT.GNAV_SELECT_surveyScoreCache.csvs.push({
				'surveyID' : surveyID,
				'surveyMData' : data
			});
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_SELECT.failRequest("getSurveyScores", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
	getDefinitions: function(callback){
		GNAV_MAIN.showStatusMessage("getting all the definitions");
		jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_proc',
			'GNAV_SELECT_allDefs' : 1,
			'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
			GNAV_MAIN.showStatusMessage("got all the definitions");
			callback(null, data);
		})
		.fail(function (xhr, textStatus, errorThrown) {
			GNAV_MAIN.showStatusMessage("failed getting all the definitions....");
			GNAV_SELECT.failRequest("getAllScores", xhr, textStatus, errorThrown);
			callback(1, null);
		});
	},
	showLogin: function(callback){
        jQuery.post(GNAV_SELECT.GNAV_SELECT_DATA_URL, {
			action : 'gnav_login',
            curURL : window.location.href,
			'security' : GNAV_admin_local.ajax_nonce
		})
		.done(function (data) {
            callback(null, data);
		})
        .fail(function (xhr, textStatus, errorThrown) {
			GNAV_SELECT.failRequest("showLogin", xhr, textStatus, errorThrown);
			callback(1, null);
		});
    },
    failRequest : function (fName, xhr, textStatus, err) {
		console.log("failed function: " + fName);
		console.log("readyState: " + xhr.readyState);
		console.log("responseText: " + xhr.responseText);
		console.log("status: " + xhr.status);
		console.log("text status: " + textStatus);
		console.log("error: " + err);
	},
	/***************************/
	/********  BROWSER *********/
	/***************************/
	flash: function(element){
        jQuery(element).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    },

};