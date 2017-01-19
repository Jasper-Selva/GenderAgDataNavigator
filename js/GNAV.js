var GNAV_MAIN={
    spinnerOpts:{
          lines: 9 // The number of lines to draw
        , length: 28 // The length of each line
        , width: 14 // The line thickness
        , radius: 43 // The radius of the inner circle
        , scale: 0.4 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#000' // #rgb or #rrggbb or array of colors
        , opacity: 0.15 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 85 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '50%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'absolute' // Element positioning
    },
    spinner: 0,
	supportsTemplate: true,
    init: function(){
        var current_user = GNAV_admin_local.current_user_id;
		GNAV_MAIN.supportsTemplate=GNAV_MAIN.checkSupportsTemplate();

        if(current_user==0){
            GNAV_MAIN.init_minimal();
        }
        else{
            GNAV_MAIN.init_buttons();
        }
    },
    init_minimal: function(){
        jQuery('#GNAV_MAIN_SELECT_BAR').addClass('disabled');
        jQuery('#GNAV_ADMIN').removeClass('enabled');
        jQuery('#GNAV_USER_ADMIN_CNT').removeClass('enabled');
        jQuery('#GNAV_SELECT_CONTAINER').addClass('enabled');
        GNAV_SELECT.init();
    },
    init_buttons: function(){
        var user_rights=GNAV_admin_local.current_user_rights;
		jQuery('#GNAV_MAIN_SELECT_BAR').removeClass('disabled');
        if(user_rights && user_rights.hasOwnProperty('gnav_allow_mod_users') && user_rights.gnav_allow_mod_users){
            jQuery('#GNAV_MAIN_SELECT_USER_ADMIN').parent('.GNAV_MAIN_BUTTON_HL').addClass('enabled');
            jQuery('#GNAV_MAIN_SELECT_USER_ADMIN').parent('.GNAV_MAIN_BUTTON_HL').removeClass('disabled');
        }
        else{
            jQuery('#GNAV_MAIN_SELECT_USER_ADMIN').parent('.GNAV_MAIN_BUTTON_HL').removeClass('enabled');
            jQuery('#GNAV_MAIN_SELECT_USER_ADMIN').parent('.GNAV_MAIN_BUTTON_HL').addClass('disabled');
        }
        jQuery("#GNAV_MAIN_SELECT_SELECT").click(function(){
            GNAV_MAIN.empty_content();
            jQuery('#GNAV_ADMIN').removeClass('enabled');
            jQuery('#GNAV_USER_ADMIN_CNT').removeClass('enabled');
            jQuery('#GNAV_SELECT_CONTAINER').addClass('enabled');
            GNAV_SELECT.init();
        });
      
        jQuery("#GNAV_MAIN_SELECT_DATA_ADMIN").click(function(){
            GNAV_MAIN.empty_content();
            jQuery('#GNAV_SELECT_CONTAINER').removeClass('enabled');
            jQuery('#GNAV_USER_ADMIN_CNT').removeClass('enabled');
            jQuery('#GNAV_ADMIN').addClass('enabled');
            GNAV_admin.init()
        });
        jQuery("#GNAV_MAIN_SELECT_USER_ADMIN").click(function(){
            GNAV_MAIN.empty_content();
            jQuery('#GNAV_ADMIN').removeClass('enabled');
            jQuery('#GNAV_SELECT_CONTAINER').removeClass('enabled');
            jQuery('#GNAV_USER_ADMIN_CNT').addClass('enabled');
            GNAV_user_admin.init();
        });

        jQuery(".GNAV_MAIN_BUTTON_HL").hover(function(){jQuery(this).addClass('hover');},function(){jQuery(this).removeClass('hover');});
        
        jQuery(".GNAV_MAIN_BUTTON_HL").click(function(){
            jQuery('.GNAV_MAIN_BUTTON_HL').removeClass('highlight');
            jQuery(this).addClass('highlight');
        });
        jQuery('#GNAV_MAIN_SELECT_SHOW_HELP').click(function(){
            // get the selected page
            GNAV_MAIN.empty_help();
            jQuery('.overlay').addClass('hideContent');
            var hl = jQuery('.GNAV_MAIN_BUTTON_HL.highlight');
            if(typeof hl != typeof undefined){
                var hlc = jQuery(hl).children('.GNAV_MAIN_SELECT');
                var hlcID = jQuery(hlc).attr('id');
                if(hlcID =="GNAV_MAIN_SELECT_SELECT"){
                    jQuery('#GNAV_MAIN_CHELP_SELECTOR').addClass('enabled');
                    jQuery('#GNAV_MAIN_CONTEXT_HELP').fadeIn(150);
                    jQuery('.GNAV_MAIN_CONTEXT_HELP').addClass('show');
                }
                if(hlcID =="GNAV_MAIN_SELECT_DATA_ADMIN"){
                    jQuery('#GNAV_MAIN_CHELP_DADMIN').addClass('enabled');
                    jQuery('#GNAV_MAIN_CONTEXT_HELP').fadeIn(150);
                    jQuery('.GNAV_MAIN_CONTEXT_HELP').addClass('show');
                }
                if(hlcID =="GNAV_MAIN_SELECT_USER_ADMIN"){
                    jQuery('#GNAV_MAIN_CHELP_UADMIN').addClass('enabled');
                    jQuery('#GNAV_MAIN_CONTEXT_HELP').fadeIn(150);
                    jQuery('.GNAV_MAIN_CONTEXT_HELP').addClass('show');
                }
            }
        });
        jQuery('.GNAV_MAIN_CONTEXT_HELP').click(function(){
            jQuery('.overlay').removeClass('hideContent');
            jQuery(this).fadeOut(300, function(){
                GNAV_MAIN.empty_help();
                jQuery(this).removeClass('show');
                jQuery(this).removeAttr('style');
                jQuery(this).children().removeAttr('style');
            });
        });
            
    },
    empty_content: function(){
        //jQuery('#GNAV_SELECT_CNTNT').empty();
        jQuery('#GNAV_SELECT_RES_CNTNT').empty();
        jQuery('#GNAV_ADMIN_SVAL_UL').empty();
        jQuery('#GNAV_ADMIN_META_UL').empty();
        jQuery('ul#GNAV_USER_LIST_UL').empty();
    },
    empty_help: function(){
        jQuery('#GNAV_MAIN_CHELP_SELECTOR').removeClass('enabled');
        jQuery('#GNAV_MAIN_CHELP_DADMIN').removeClass('enabled');
        jQuery('#GNAV_MAIN_CHELP_UADMIN').removeClass('enabled');
    },
    show_spinner: function(){
        if(!GNAV_MAIN.spinner || GNAV_MAIN.spinner==0){
            var overlay=jQuery('.overlay');
            var target=jQuery(overlay).children('.GNAV_spin_container');
            if(!target || target.length==0){
                var ntarget=document.createElement('div');
                jQuery(ntarget).addClass('GNAV_spin_container');
                jQuery(overlay).append(ntarget);
                target=jQuery(overlay).children('.GNAV_spin_container');
            }
            GNAV_MAIN.spinner=new Spinner(GNAV_MAIN.spinnerOpts).spin();
            jQuery(target).append(GNAV_MAIN.spinner.el);
            console.log('spinning');
        }
    },
    remove_spinner: function(){
        if(GNAV_MAIN.spinner && GNAV_MAIN.spinner!=0){
            GNAV_MAIN.spinner.stop();
        }
        GNAV_MAIN.spinner=0;
    },
    showStatusMessage: function(iMessage){
		var statContainer=jQuery('.GNAV_spin_status_container');
		var mDiv=document.createElement('div')
		jQuery(mDiv).addClass("GNAV_spin_status_message");
		jQuery(mDiv).text(iMessage);
		jQuery(mDiv).attr('status_message',iMessage);
		jQuery(statContainer).append(mDiv);
		
		mDiv=jQuery('.GNAV_spin_status_message[status_message="'+iMessage+'"]');
		jQuery(mDiv).fadeIn(300).delay(900).fadeOut(400, function(){jQuery(this).remove();});
	},
	
	UA_IS_MSIE : function () {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf("MSIE ");
		if (msie > 0 || !!window.navigator.userAgent.match(/Trident.*rv\:11\./)) {
			return true;
		}
		return 0;
	},
	getTemplateCloneIE: function(template_ID){
		var templates=document.getElementsByTagName("template");

		var i, iM=templates.length;
		var fragment = document.createDocumentFragment();
		var content = document.createDocumentFragment();

        var children;
		var c, cM;
		for(i=0;i<iM;i++){
			if(jQuery(templates[i]).attr('id') && jQuery(templates[i]).attr('id')==template_ID){
				children=templates[i].childNodes;
				cM=children.length;
				for(c=0;c<cM;c++){
					if(children[c].nodeType==1){
						content.appendChild(children[c].cloneNode(true,true));
					}
				}
				fragment.content=content;
				return fragment;
			}
		}
		return false;
	},
	checkSupportsTemplate: function () {
		return 'content' in document.createElement('template');
	}
}
    
jQuery(document).ready(function () {
    if(!window.jQuery){
        console.log("jQuery not found");
    }
    GNAV_MAIN.init();

});