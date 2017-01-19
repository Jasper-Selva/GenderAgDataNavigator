<br/>
<button id="GNAV_insert_definitions" class="GNAV_padmin_button">insert definitions</button>
<br/>
<button id="GNAV_insert_base_data" class="GNAV_padmin_button">insert base data</button>
<br/>
<button id="GNAV_delete_all_data" class="GNAV_padmin_button">delete all data</button>
<br/>
<button id="GNAV_backup_data" class="GNAV_padmin_button">backup all data</button><button id="GNAV_backup_data_download" class="GNAV_padmin_button disabled">download data</button>
<br/>
<button id="GNAV_download_techdoc" class="GNAV_padmin_button">download technical documentation</button>
<br/>

<span class="GNAV_WARNING">WARNING: pressing these button will add or remove data in the GNAV database WITHOUT CHECKS!, <br/>
You will NOT be asked for confirmation, things will just happen. <br/>
Only press a button if you are really absolutely and completely SURE what you are doing!<br/></span>
<span class="GNAV_WARNING">
	insert definitions will insert all the definitions. <br/>
	insert base data will insert an initial set of surveys and survey data.<br/>
	delete all data will DELETE ALL THE GNAV data, no backups, you will NOT be able to get anything back.<br/>
	backup all data will create a text dump file of the GNAV database, which can (in theory) be used to recreate the database.<br/>
</span>

<style type="text/css">
	.GNAV_padmin_button{
		width: 130px;
		margin-top: 5px;
		margin-right: 10px;
	}
	.GNAV_padmin_button.disabled{
		visibility: hidden;
	}
	.GNAV_WARNING{
		margin-top: 5px;
		font-size: 120%;
		line-height: 1.5; 
	}
</style>