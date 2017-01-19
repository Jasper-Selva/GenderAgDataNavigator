GNAV_padmin={
	init: function(){
		jQuery('#GNAV_insert_base_data').click(function(){
			var res=GNAV_padmin.insert_base_data();
		});
		jQuery('#GNAV_insert_definitions').click(function(){
			var res=GNAV_padmin.insert_definitions();
		});
		jQuery('#GNAV_delete_all_data').click(function(){
			var res=GNAV_padmin.delete_all_data();
		});
		jQuery('#GNAV_backup_data').click(function(){
			var res=GNAV_padmin.backup_all_data();
		});
		jQuery('#GNAV_backup_data_download').click(function(e){
			e.preventDefault();  //stop the browser from following
            var myHref = jQuery(this).attr('href');
            window.open(myHref, '_blank');
			//window.location.href = jQuery(this).attr('href');
		});
        jQuery('#GNAV_download_techdoc').click(function(e){
            var myHref=GNAV_padmin_local.techdoc;
            window.open(myHref, '_blank');
        });
	},
	
	insert_definitions: function(){
		jQuery.post(GNAV_padmin_local.GNAV_ajax_url, {
            action : 'gnav_padmin',
            'GNAV_PADMIN_INSERT_DEFINITIONS' : 1,
            'security' : GNAV_padmin_local.ajax_nonce
        })
        .done(function (data) {
			alert(data);
            return data;
        })
        .fail(function (xhr, textStatus, errorThrown) {
			alert("FAIL");
            return "failed";
        });
	},
		
	insert_base_data: function(){
		jQuery.post(GNAV_padmin_local.GNAV_ajax_url, {
            action : 'gnav_padmin',
            'GNAV_PADMIN_INSERT_BASE_DATA' : 1,
            'security' : GNAV_padmin_local.ajax_nonce
        })
        .done(function (data) {
			alert(data);
            return data;
        })
        .fail(function (xhr, textStatus, errorThrown) {
			alert("FAIL");
            return "failed";
        });
	},
	delete_all_data: function(){
		jQuery.post(GNAV_padmin_local.GNAV_ajax_url, {
            action : 'gnav_padmin',
            'GNAV_PADMIN_REMOVE_ALL_DATA' : 1,
            'security' : GNAV_padmin_local.ajax_nonce
        })
        .done(function (data) {
			alert(data);
            return data;
        })
        .fail(function (xhr, textStatus, errorThrown) {
			alert("FAIL");
            return "failed";
        });
	},
	backup_all_data: function(){
		jQuery.post(GNAV_padmin_local.GNAV_ajax_url, {
            action : 'gnav_padmin',
            'GNAV_PADMIN_BACKUP_DATA' : 1,
            'security' : GNAV_padmin_local.ajax_nonce
        })
        .done(function (data) {
			var dlb=jQuery('#GNAV_backup_data_download');
			if(data=="false"){
				jQuery(dlb).text('FAILED');
				jQuery(dlb).attr('href',"");
			}
			else{
				jQuery(dlb).attr('href',data);
			}
			jQuery(dlb).removeClass('disabled');
            return data;
        })
        .fail(function (xhr, textStatus, errorThrown) {
			var dlb=jQuery('#GNAV_backup_data_download');
			jQuery(dlb).addClass('disabled');
			alert("FAIL");
            return "failed";
        });
	},
		
		
		
}
jQuery(document).ready(function () {
    if(!window.jQuery){
        console.log("jQuery not found");
    }
    GNAV_padmin.init();

});
	