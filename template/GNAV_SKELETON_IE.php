<div id="navListItem" class = "ieTemplate">
	<div class="GNAV_accordion_item GNAV_subaccord">
		<div class="GNAV_lh_c">
			<div class="GNAV_lh GNAV_accordion_item"></div>
			<div class="GNAV_lh_r">
				
				<img class="GNAV_exp_arrow" src="">
				<input type="checkbox" class="GNAV_selectAll">
			</div>
		</div>
	</div>
</div>
<li id="valueListItem" class="GNAV_lh ieTemplate" class = "ieTemplate">
	<div class="GNAV_dataCat"></div>
	<input type="checkbox" class="GNAV_checkBox GNAV_sh">
	<div class="GNAV_valText"></div>
</li>
<li id="suveyListItem" class="ieTemplate GNAV_res_li collapse in" aria-expanded="true">
	<a class="GNAV_res_a" href="#" ></a>
</li>
<div id = "GNAV_ADMIN_BAR_TEMPLATE" class = "GNAV_ADMIN_BAR ieTemplate">
	<a class = "GNAV_ADMIN_DOWNLOAD">Download div file</a>
	<form id="GNAV_ADMIN_FORM" name = "GNAV_ADMIN_FORM" class= "GNAV_ADMIN_FORM" method="POST" enctype="multipart/form-data" onsubmit="GNAV.admin_upload_xl()">
		<input type="hidden" name="_wpnonce" id="_wpnonce">
		<input type="hidden" name="action" value="gnav_proc">
		<input type="hidden" name="GNAV_Data_upload" value="1">
		<input type="file" name="GNAV_file" accept=".xls,.xlsx">
		<input type="submit"  value="Upload file">
	</form>
</div>
<div id="GNAV_act_container_TEMPLATE" class = "ieTemplate">
		<button type="button" id="GNAV_ADMIN_BUTTON" >data admin</button>
		<div id="GNAV_popover_toggle_text">Show context information</div>
		<input type="checkbox" id="GNAV_popover_toggle_input">
		<button id="GNAV_reset_selector">Reset selection</button>
</div>
