var GNAV_user_admin = {
    currentUsers: 0,
    init: function(){
        // verify if user is logged in.
        if(!GNAV_user_admin.verify_own_rights()){
            jQuery("#GNAV_MAIN_SELECT_SELECT").click();
            
            return false;
        }
        var gnuQ = d3_queue.queue()
            .defer(GNAV_user_admin.getAllCurrentUsers)
			.await(function (error, AllCurrentUsers){
                if(error){console.log(error);return}
                GNAV_user_admin.currentUsers = AllCurrentUsers;
                GNAV_user_admin.fillUserList();
                GNAV_user_admin.setAct();
            });
    },
    verify_own_rights: function(){
        if (typeof GNAV_admin_local === typeof undefined){
            return false;
        }
        else{
            if(!GNAV_admin_local.hasOwnProperty('current_user_id') || GNAV_admin_local.current_user_id==0){
                return false;
            }
            if(GNAV_admin_local.hasOwnProperty('current_user_rights')){
                if(GNAV_admin_local.current_user_rights.hasOwnProperty('gnav_allow_mod_users') && GNAV_admin_local.current_user_rights.gnav_allow_mod_users==1){return true;}
            }
        }
        return false;
    },
    reloadData: function(){
        var gnuQ = d3_queue.queue()
            .defer(GNAV_user_admin.getAllCurrentUsers)
			.await(function (error, AllCurrentUsers){
                if(error){console.log(error);return}
                jQuery("#GNAV_USER_LIST_UL").empty();
                GNAV_user_admin.currentUsers = AllCurrentUsers;
                GNAV_user_admin.fillUserList();
                GNAV_user_admin.setAct();
            });
    },
    fillUserList: function(){
        var i, iM = GNAV_user_admin.currentUsers.length;
        var parentList = jQuery("#GNAV_USER_LIST_UL");
        for (i= 0; i<iM; i+=1){
            GNAV_user_admin.createUserItem(parentList, GNAV_user_admin.currentUsers[i]);
        }
        GNAV_user_admin.setAct();
    },
    createUserItem: function(parent, userObject){
		var t, tClone;
		
		if(!GNAV_MAIN.supportsTemplate){
				tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_USER_ADMIN_LISTITEM");
			}
			else{
				t = document.querySelector("template#GNAV_USER_ADMIN_LISTITEM");
				tClone = t.cloneNode(true, true);
		}

        var li_item = tClone.content.querySelector("li.GNAV_USER_ADMIN_LI");
        var uu = tClone.content.querySelector("span.GNAV_USER_ADMIN_USER");
        var uaa = tClone.content.querySelector("span.GNAV_USER_ADMIN_user_allowed_accept");
        var uamu = tClone.content.querySelector("span.GNAV_USER_ADMIN_user_allowed_mod_users");
        jQuery(li_item).attr('uid', userObject.UID);
        jQuery(uu).attr('uid', userObject.UID);
        if(userObject.hasOwnProperty('display_name') && userObject.display_name.length>0){
            jQuery(uu).text(userObject.display_name);
        }
        else{
            jQuery(uu).text(userObject.user_email);
        }
        var inputs = tClone.content.querySelector('input');
        jQuery(inputs).prop('checked', false);
        
        if(userObject.gnav_allow_accept_reject==1){jQuery(uaa).children('input').prop('checked',true);}
        if(userObject.gnav_allow_mod_users==1){jQuery(uamu).children('input').prop('checked',true);}
        if(userObject.user_stat){
            if(userObject.user_stat.indexOf('administrator')>-1){
               jQuery(uaa).children('input').attr("disabled","disabled");
                jQuery(uamu).children('input').attr("disabled","disabled");
            }
        }
        jQuery(parent).append(tClone.content);
        GNAV_user_admin.setAct();
    },
    setAct: function(){
        jQuery('.GNAV_USER_ADMIN_CB').off('change');
        jQuery('.GNAV_USER_ADMIN_BUTTON_CHANGE').off('click');
        jQuery('.GNAV_USER_ADMIN_BUTTON_CHANGE_CONFIRM').off('click');
        jQuery('.GNAV_USER_ADMIN_BUTTON_CHANGE_CANCEL').off('click');
        jQuery('input#GNAV_USER_ADMIN_SEARCH_INPUT').off('input');
        jQuery('.GNAV_USER_ADMIN_CB').change(function() {
            //jQuery('.GNAV_USER_ADMIN_BUTTON_CHANGE').removeClass('enabled');
            var myListItem = jQuery(this).closest('li.GNAV_USER_ADMIN_LI');
            var myUID = myListItem.attr("uid");
            var UserListItems = jQuery('li.GNAV_USER_ADMIN_LI');
            var cListItem, cUID;
            jQuery(UserListItems).each(function(){
                cListItem = jQuery(this);
                cUID = jQuery(cListItem).attr('uid')
                    if (cUID != myUID){GNAV_user_admin.setOriginalRights(cUID);}
            });
            if(GNAV_user_admin.isOriginalRights(myUID)==false){
                myListItem.find('.GNAV_USER_ADMIN_BUTTON_CHANGE').addClass('enabled');
            }
        });
        jQuery('.GNAV_USER_ADMIN_BUTTON_CHANGE').click(function(){
            var myListItem = jQuery(this).closest('li.GNAV_USER_ADMIN_LI');
            var myACREJ = jQuery(myListItem).find('.GNAV_ADMIN_CONFREJ');
            jQuery(myACREJ).addClass('confirm');
        });
        jQuery('.GNAV_USER_ADMIN_BUTTON_CHANGE_CANCEL').click(function(){
            var myListItem = jQuery(this).closest('li.GNAV_USER_ADMIN_LI');
            var myUID = myListItem.attr("uid");
            jQuery(myListItem).find('.GNAV_ADMIN_CONFREJ').removeClass('confirm');
            jQuery(myListItem).find('.GNAV_USER_ADMIN_BUTTON_CHANGE').removeClass('enabled');
            GNAV_user_admin.setOriginalRights(myUID);
        });
        jQuery('input#GNAV_USER_ADMIN_SEARCH_INPUT').on('input', function(e){
            jQuery('#GNAV_USER_ADMIN_SEARCH_R').empty();
            var sTerm = jQuery(this).val();
            if (sTerm.length>3){
                var q = d3_queue.queue()
                    .defer(GNAV_user_admin.getUserByString, sTerm)
                    .await(function(error, data){
                        if(error){return;}
                        //console.log(data);
                        jQuery('#GNAV_USER_ADMIN_SEARCH_R').empty();
                        GNAV_user_admin.fillUserSearchResult(data);
                    });
            }
        });
        jQuery('.GNAV_USER_ADMIN_BUTTON_CHANGE_CONFIRM ').click(function(){
            var myElement=jQuery(this).closest('.GNAV_USER_ADMIN_LI');
            var myUID = jQuery(myElement).attr('uid');
            /*
                $gnav_allow_accept_reject = TRUE;
                $gnav_allow_mod_users = TRUE;
            */
            var userObject = {
                "UID": myUID,
                "gnav_allow_accept_reject": 0,
                "gnav_allow_mod_users": 0,
                };
            var uu = jQuery(myElement).children("span.GNAV_USER_ADMIN_USER");
            var uaa = jQuery(myElement).children("span.GNAV_USER_ADMIN_user_allowed_accept");
            var uamu = jQuery(myElement).children("span.GNAV_USER_ADMIN_user_allowed_mod_users");
            if(jQuery(uaa).children('input').prop('checked')){userObject.gnav_allow_accept_reject = 1;}
            if(jQuery(uamu).children('input').prop('checked')){userObject.gnav_allow_mod_users = 1;}
            var Q = d3_queue.queue()
                .defer(GNAV_user_admin.sendUserUpdate, userObject)
                .await(function(error, data){
                    if(!error){
                        //console.log(data);
                        GNAV_user_admin.reloadData();
                    }
                });
        });
        jQuery('.GNAV_USER_ADMIN_CBSH').hover(
            function(){
                var rid = jQuery(this).attr('rid');
                if(typeof rid != typeof undefined){jQuery('.GNAV_USER_ADMIN_EXP_LII[rid="'+rid+'"]').addClass('highlight');}
            }, function(){
                jQuery('.GNAV_USER_ADMIN_EXP_LII').removeClass('highlight');}
                );
		jQuery('#GNAV_update_defs').click(function(){
			var Q = d3_queue.queue()
                .defer(GNAV_user_admin.updateDefs)
                .await(function(error, data){
                    if(!error){
                        GNAV_user_admin.reloadData();
                    }
                });
		});
                
        
        
    },
    fillUserSearchResult: function(users){
        var i, iM = users.length;
        var parentList = jQuery('#GNAV_USER_ADMIN_SEARCH_R');
        for (i=0; i<iM; i+=1){
            GNAV_user_admin.createUserSearchResultElement(parentList,users[i]);
        }
    },
    createUserSearchResultElement: function(parent, userItem){
        /*
            <template class="GNAV_USER_ADMIN_SURESLI">
                <li class="GNAV_USER_ADMIN_ULI">
                    <span class="GNAV_USER_ADMIN_ULI_ID"></span>
                    <span class="GNAV_USER_ADMIN_ULI_FNAME"></span>
                    <span class="GNAV_USER_ADMIN_ULI_LNAME"></span>
                    <span class="GNAV_USER_ADMIN_ULI_EMAIL"></span>
                </li>
            </template>
        */
        /*
        $uObj->UID = $usr->ID;
			$uObj->first_name = $usr->first_name;
			$uObj->last_name = $usr->last_name;
			$uObj->user_email= $usr->user_email;
			if(isset($usr->user_nicename)){
				$uObj->user_nicename= $usr->user_nicename;
			}
            */
			
		if(!GNAV_MAIN.supportsTemplate){
				tClone=GNAV_MAIN.getTemplateCloneIE("GNAV_USER_ADMIN_SURESLI");
			}
			else{
				t = document.querySelector("template#GNAV_USER_ADMIN_SURESLI");
				tClone = t.cloneNode(true, true);
		}	
			
			
        var ULI = tClone.content.querySelector("li.GNAV_USER_ADMIN_ULI");
        var UID = tClone.content.querySelector("span.GNAV_USER_ADMIN_ULI_ID");
        var UFN = tClone.content.querySelector("span.GNAV_USER_ADMIN_ULI_FNAME"); 
        var ULN = tClone.content.querySelector("span.GNAV_USER_ADMIN_ULI_LNAME"); 
        var UEM = tClone.content.querySelector("span.GNAV_USER_ADMIN_ULI_EMAIL"); 
        jQuery(ULI).attr('uid',userItem.UID);
        jQuery(UID).text(userItem.UID);
        jQuery(UID).attr('uid',userItem.UID);
        jQuery(UFN).text(userItem.first_name);
        jQuery(ULN).text(userItem.last_name);
        jQuery(UEM).text(userItem.user_email);
        jQuery(parent).append(tClone.content);
        GNAV_user_admin.setUserListAct();
    },    
    setUserListAct: function(){
        jQuery('.GNAV_USER_ADMIN_ULI').off('click');
        jQuery('.GNAV_USER_ADMIN_ULI').click(function(){
            var MyParentList = jQuery('#GNAV_USER_LIST_UL');
            var myUID = jQuery(this).attr('uid');
            if(!GNAV_user_admin.userInList(myUID)){
                var Q = d3_queue.queue()
                    .defer(GNAV_user_admin.getUserFromServer,myUID)
                    .await(function(error, data){
                        if(error){ return;}
                        if(typeof data != typeof undefined){
                            // add user to the userlist
                            var parentList = jQuery("#GNAV_USER_LIST_UL");
                            GNAV_user_admin.createUserItem(parentList, data);
                        }
                        //GNAV_user_admin.createUserSearchResultElement(MyParentList,data);
                    });
            }
        });
        jQuery('.GNAV_USER_ADMIN_ULI').hover(function(){
            var myUID = jQuery(this).attr('uid');
            jQuery('.GNAV_USER_ADMIN_LI[uid="'+myUID+'"]').addClass('searchHighlight');
        },
        function(){
            var myUID = jQuery(this).attr('uid');
            jQuery('.GNAV_USER_ADMIN_LI[uid="'+myUID+'"]').removeClass('searchHighlight');
        });
    },
    setOriginalRights: function(UID){
            /*
                $gnav_allow_accept_reject = TRUE;
                $gnav_allow_mod_users = TRUE;
            */
        
        var User, UserListItems;
        var uaa,uaco,uacp,uarp,uamu;
        var cListItem;
        var inputs;
        User = GNAV_user_admin.getUserByID(UID);
        if(!User){return;}
        UserListItems = jQuery('li.GNAV_USER_ADMIN_LI');
        jQuery(UserListItems).each(function(){
            cListItem = jQuery(this);
            if (jQuery(cListItem).attr('uid') == UID){
                inputs = jQuery(cListItem).find('input.GNAV_USER_ADMIN_CB');
                jQuery(inputs).prop('checked', false);
                uaa = cListItem.find("span.GNAV_USER_ADMIN_user_allowed_accept");
                uamu = jQuery(cListItem).find("span.GNAV_USER_ADMIN_user_allowed_mod_users");
                if(User.gnav_allow_accept_reject==1){jQuery(uaa).children('input').prop('checked',true);}
                if(User.gnav_allow_mod_users==1){jQuery(uamu).children('input').prop('checked',true);}
                if(User.user_stat){
                    if(User.user_stat.indexOf('super admin')>-1){
                        jQuery(uacp).children('input').attr("disabled","disabled");
                        jQuery(uarp).children('input').attr("disabled","disabled");
                    }
                    if(User.user_stat.indexOf('administrator')>-1){
                       jQuery(uaa).children('input').attr("disabled","disabled");
                        jQuery(uaco).children('input').attr("disabled","disabled");
                        jQuery(uamu).children('input').attr("disabled","disabled");
                    }
                }
            }
        });
    },
    isOriginalRights: function(UID){
        var User, UserListItems;
        var uaa,uaco,uacp,uarp,uamu;
        var cListItem;
        var res = true;
        User = GNAV_user_admin.getUserByID(UID);
        /*
                $gnav_allow_accept_reject = TRUE;
                $gnav_allow_mod_users = TRUE;
            */
        if(!User){return false;}
        UserListItems = jQuery('li.GNAV_USER_ADMIN_LI');
        jQuery(UserListItems).each(function(){
            cListItem = jQuery(this);
            if (jQuery(cListItem).attr('uid') == UID){
                uaa = cListItem.find("span.GNAV_USER_ADMIN_user_allowed_accept");
                uamu = jQuery(cListItem).find("span.GNAV_USER_ADMIN_user_allowed_mod_users");
                if((User.gnav_allow_accept_reject==1 && jQuery(uaa).children('input').prop('checked')==false) || (User.gnav_allow_accept_reject==0 && jQuery(uaa).children('input').prop('checked')==true)){ res = false;}
                if((User.gnav_allow_mod_users==1 && jQuery(uamu).children('input').prop('checked')==false) || (User.gnav_allow_mod_users==0 && jQuery(uamu).children('input').prop('checked')==true)){ res = false;}
 
            }
        });
        return res;
    },
    getUserByID: function(UID){
        var i, iM = GNAV_user_admin.currentUsers.length;
        for (i = 0; i < iM; i += 1){
            if(GNAV_user_admin.currentUsers[i].hasOwnProperty('UID') && GNAV_user_admin.currentUsers[i].UID == UID){
                return GNAV_user_admin.currentUsers[i];
            }
        }
        return false;
    },
    /****************************/
    /******  AJAX STUFF  ********/
    /****************************/
    getUserByString: function(sString, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_UADMIN_getSearchUser' : sString,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_user_admin.failRequest("getAllCurrentUsers", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    sendUserUpdate: function(ur_object, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_UADMIN_setUserRights' : JSON.stringify(ur_object),
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_user_admin.failRequest("getAllCurrentUsers", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    userInList: function(uid){
        var res = false;
        jQuery('.GNAV_USER_ADMIN_LI').each(function(){
            if(jQuery(this).attr('uid')==uid){
                res = true;
                return false;
            }
        });
        return res;
    },
    getUserFromServer: function(UID, callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_UADMIN_getUserByID' : UID,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_user_admin.failRequest("getUserFromServer", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
    getAllCurrentUsers: function(callback){
        jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_UADMIN_getAllCUSERS' : 1,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_user_admin.failRequest("getAllCurrentUsers", xhr, textStatus, errorThrown);
            callback(1, null);
        });
    },
	updateDefs: function(callback){
		jQuery.post(GNAV_admin_local.GNAV_ajax_url, {
            action : 'gnav_proc',
            'GNAV_admin_update_defs' : 1,
            'security' : GNAV_admin_local.ajax_nonce
        })
        .done(function (data) {
            callback(null, data);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            GNAV_user_admin.failRequest("updateDefs", xhr, textStatus, errorThrown);
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
    }
}