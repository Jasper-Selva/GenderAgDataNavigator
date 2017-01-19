<div id="GNAV_ADMIN">
	<div id="GNAV_ADMIN_SELECT_Survey">
		<div class="GNAV_ADMIN_UPLOAD_SURVEY_CNT">
		<div class="GNAV_ADMIN_HEADER_container"><span class="GNAV_ADMIN_HEADER">Add survey</span><span class="GNAV_ADMIN_ADD_HIDE" show_add_sv="show">hide/show</span></div>
		<div id="GNAV_ADMIN_ADD_BY_FILE">
			<span class="GNAV_ADMIN_ADD_BY">by excel upload</span>
			<span class="GNAV_ADMIN_ADD_BY_UL GNAV_ADMIN_ADD_BY_CNT">
				<a class = "GNAV_ADMIN_DOWNLOAD" download>Download template file</a>
				<form id="GNAV_ADMIN_FORM_DATA_UPLOAD" name="GNAV_ADMIN_FORM_DATA_UPLOAD" class= "GNAV_ADMIN_FORM_DATA_UPLOAD" method="POST" enctype="multipart/form-data">
					<input type="hidden" name="_wpnonce" id="_wpnonce">
					<input type="hidden" name="action" id="GNAV_ADMIN_DU_VALUE">
					<input type="hidden" name="GNAV_Data_upload" value="1">
					<input type="file" name="GNAV_file" accept=".xls,.xlsx" class="GNAV_ADMIN_SEL_FILE">
					
				</form>
			</span>
			<input type="submit" value="Upload file" id="GNAV_ADMIN_FORM_DATA_UPLOAD_SUBMIT" form="GNAV_ADMIN_FORM_DATA_UPLOAD">
		</div>
		<div id="GNAV_ADMIN_ADD_BY_ENTRY">
			<span class="GNAV_ADMIN_ADD_BY">by direct input</span>
			<input id="GNAV_ADMIN_ADD_BY_INPUT" class="GNAV_ADMIN_ADD_BY_CNT" type="text">
			<button id="GNAV_ADMIN_ADD_BY_INPUT_submit">add this survey</button>
		</div>
		
			
			
		</div>
		<div class="GNAV_ADMIN_HEADER">Manage data</div>
		<div class="GNAV_ADMIN_SV_STATUS">
			<div class="GNAV_ADMIN_SV_STATUS_H">Filter by survey status</div>
			<form class="GNAV_ADMIN_SV_STATUS_FRM" action="">
			</form>
		</div>
		<div class="GNAV_ADMIN_VS_STATUS">
			<div class="GNAV_ADMIN_SV_STATUS_H">Filter by version status</div>
			<form class="GNAV_ADMIN_VS_STATUS_FRM" action="">
			</form>
		</div>
		<div class="GNAV_ADMIN_HIDE_FILTER"><span class="GNAV_ADMIN_HIDE_FILTER_BTN">show/hide filter</span></div>
		
		<div class="GNAV_ADMIN_SURVEY_SELECTOR_CNT">
			<select class="GNAV_ADMIN_SURVEY_SELECTOR">
			</select>
			<select class="GNAV_ADMIN_SURVEY_VERSION_SEL">
			</select>
			<button class="GNAV_ADMIN_SURVEY_SELECTOR_EXEC">(re)load data</button>
		</div>
		<div class="GNAV_ADMIN_MANAGE_SURVEYSTATUS"><button class="GNAV_ADMIN_MANAGE_SURVEYSTATUS">Manage status</button></div>
	</div>
	<div id="GNAV_ADMIN_DISPLAY_SURVEY">
		<div id="GNAV_ADMIN_SCORE_HEADER" class="GNAV_ADMIN_SHEADER"><span class="GNAV_ADMIN_H2">Score values</span><span class="GNAV_ADMIN_CLICK_EXPAND">click to show values</span></div>
		<ul id="GNAV_ADMIN_SVAL_UL"></ul>
		<div id="GNAV_ADMIN_META_HEADER" class="GNAV_ADMIN_SHEADER"><span class="GNAV_ADMIN_H2">Meta data</span><span class="GNAV_ADMIN_CLICK_EXPAND">click to show values</span></div>
		<ul id="GNAV_ADMIN_META_UL"></ul>
		
		<div id="GNAV_ADMIN_ADD_META">
			<h4>Add new meta category</h4>
			<div id="GNAV_ADMIN_SEARCH_META">
				<span id="GNAV_ADMIN_SEARCH_META_LABEL">Search metaCategory</span>
				<input type="text" id="GNAV_ADMIN_SEARCH_META_INPUT"></input>
			</div>
			<ul id="GNAV_ADMIN_SEARCH_META_R">
				<li class="GNAV_ADMIN_SEARCH_META_R_default">search result</li>
			</ul>
		</div>
	</div>
</div>

<template class="GNAV_ADMIN_SCORE_HEAD">
    <li class="GNAV_ADMIN_SCORE_VALID_CNT">
        <span class="GNAV_ADMIN_SCORE_ELEMENT">
		</span>
		<img src="" class="GNAV_ADMIN_addIC UR_DEPENDENT" alt="add a value">
		<ul class="GNAV_ADMIN_SCORE_VALID_UL"></ul>
    </li>
</template>

<template class="GNAV_ADMIN_SCORE_VALID">
    <li class="GNAV_ADMIN_SCORE_VALID_CNT">
		<span class="GNAV_ADMIN_SCORE_DCAT"></span>
        <span class="GNAV_ADMIN_SCORE_ELEMENT"></span>
        <select class="GNAV_ADMIN_CHANGE_SCORE_ELEMENT_SELECT UR_DEPENDENT" ></select>
        <button class="GNAV_ADMIN_CHANGE_SCORE_EXEC UR_DEPENDENT">apply</button>
		<span class="GNAV_ADMIN_SCHANGE_confirm GNAV_ADMIN_CONFREJ red UR_DEPENDENT">confirm</span>
		<span class="GNAV_ADMIN_SCHANGE_cancel GNAV_ADMIN_CONFREJ green UR_DEPENDENT">cancel</span>
		<img src="" class="GNAV_ADMIN_remVal UR_DEPENDENT" alt="remove this value">
		<span class="GNAV_ADMIN_rem_confirm GNAV_ADMIN_CONFREJ red UR_DEPENDENT">confirm</span>
		<span class="GNAV_ADMIN_rem_cancel GNAV_ADMIN_CONFREJ green UR_DEPENDENT">cancel</span>
		<span class="GNAV_ADMIN_ADDNEW_UNDO GNAV_ADMIN_CONFREJ red UR_DEPENDENT">undo</span>
    </li>
</template>


<template class="GNAV_ADMIN_META_HEAD">
    <li class="GNAV_ADMIN_META_VALID_CNT">
		<div class="GNAV_ADMIN_META_H"> 
			<span class="GNAV_ADMIN_META_ELEMENT">
			</span>
			<img src="" class="GNAV_ADMIN_META_addIC UR_DEPENDENT" alt="add a value">
		</div>
		<ul class="GNAV_ADMIN_META_ITEM_LIST"></ul>
    </li>
</template>


<template class="GNAV_ADMIN_META_VALID">
	<li class="GNAV_ADMIN_META_VALID_CNT">
		<select class="GNAV_ADMIN_META_NEW_TEXT UR_DEPENDENT"></select>
		<input type="text" class="GNAV_ADMIN_META_NEW_TEXT UR_DEPENDENT"></input>
		<textarea class="GNAV_ADMIN_META_NEW_TEXT UR_DEPENDENT"></textarea>
		<button class="GNAV_ADMIN_META_CHANGE_EXEC UR_DEPENDENT">apply</button>
		<span class="GNAV_ADMIN_META_SCHANGE_confirm GNAV_ADMIN_CONFREJ red UR_DEPENDENT">confirm</span>
		<span class="GNAV_ADMIN_META_SCHANGE_cancel GNAV_ADMIN_CONFREJ green UR_DEPENDENT">cancel</span>
		<img src="" class="GNAV_ADMIN_META_remVal UR_DEPENDENT" alt="remove this value">
		<span class="GNAV_ADMIN_META_rem_confirm GNAV_ADMIN_CONFREJ red UR_DEPENDENT">confirm</span>
		<span class="GNAV_ADMIN_META_rem_cancel GNAV_ADMIN_CONFREJ green UR_DEPENDENT">cancel</span>
		<span class="GNAV_ADMIN_ADDNEW_META_UNDO GNAV_ADMIN_CONFREJ red UR_DEPENDENT">undo</span>
	</li>
</template>

<template class="GNAV_ADMIN_SCORE_SPECIAL_VALID">
	<li class="GNAV_ADMIN_SCORE_SPECIAL_VALID_CNT">
		<select class="GNAV_ADMIN_SCORE_SPECIAL_NEW_TEXT"></select>
		<button class="GNAV_ADMIN_SCORE_SPECIAL_CHANGE_EXEC">apply</button>
		<span class="GNAV_ADMIN_SCORE_SPECIAL_SCHANGE_confirm GNAV_ADMIN_CONFREJ red">confirm</span>
		<span class="GNAV_ADMIN_SCORE_SPECIAL_SCHANGE_cancel GNAV_ADMIN_CONFREJ green">cancel</span>
		<img src="" class="GNAV_ADMIN_SCORE_SPECIAL_remVal" alt="remove this value">
		<span class="GNAV_ADMIN_SCORE_SPECIAL_rem_confirm GNAV_ADMIN_CONFREJ red">confirm</span>
		<span class="GNAV_ADMIN_SCORE_SPECIAL_rem_cancel GNAV_ADMIN_CONFREJ green">cancel</span>
		<span class="GNAV_ADMIN_ADDNEW_SCORE_SPECIAL_UNDO GNAV_ADMIN_CONFREJ red">undo</span>
	</li>
</template>



<template class="GNAV_ADMIN_SELECT_ELEMENT">
	<option class="GNAV_ADMIN_OPTION_SURVEY"></option>
</template>
<template class="GNAV_ADMIN_VERSION_SELECT_ELEMENT">
	<option class="GNAV_ADMIN_OPTION_VERSION"></option>
</template>
<template class="GNAV_ADMIN_DU_RES">
	<div id="GNAV_ADMIN_DU_RES">
		<div class="GNAV_ADMIN_DU_RES_CLOSE">X</div>
		<div class="GNAV_ADMIN_DU_RES_HDR">Data upload results</div>
		<ul class="GNAV_ADMIN_DU_RES_UL"></ul>
	</div>
</template>
<template class="GNAV_ADMIN_DU_RES_LI">
	<li class="GNAV_ADMIN_DU_RES_LII">
	<span class="GNAV_ADMIN_DU_RES_TS"></span>
	<span class="GNAV_ADMIN_DU_RES_TXT"></span>
	</li>
</template>

<template class="GNAV_ADMIN_MANAGE_STATUS">
	<div class="GNAV_ADMIN_MANAGE_STATUS_CNT">
		<div class="GNAV_ADMIN_MANAGE_STATUS_SVN"></div>
		<div class="GNAV_ADMIN_MANAGE_STATUS_CNT_B">
			<div class="GNAV_ADMIN_MANAGE_STATUS_CNT_L">
			<div class="GNAV_ADMIN_MANAGE_STATUS_SV">
				<div class="GNAV_ADMIN_MANAGE_STATUS_SVH">
					<span class="GNAV_ADMIN_MANAGE_STATUS_SVHT">Current survey status:</span>
					<span class="GNAV_ADMIN_MANAGE_STATUS_SVHV"></span>
				</div>
				<div class="GNAV_ADMIN_MANAGE_STATUS_SV_no_publish GNAV_ADMIN_MANAGE_STATUS_BTN">Set hidden</div>
				<div class="GNAV_ADMIN_MANAGE_STATUS_SV_publish GNAV_ADMIN_MANAGE_STATUS_BTN">Publish</div>
			</div>
			<div class="GNAV_ADMIN_MANAGE_STATUS_VS">
				<div class="GNAV_ADMIN_MANAGE_STATUS_SUM_VS">
					<div class="GNAV_ADMIN_MANAGE_STATUS_SUM_VSH">List of all the versions for this survey</div>
					<ul class="GNAV_ADMIN_MANAGE_STATUS_SUM_VSUL">
					</ul>
					<div class="GNAV_ADMIN_MANAGE_STATUS_ADDVS GNAV_ADMIN_MANAGE_STATUS_BTN">Add new version</div>
				</div>
				<div class="GNAV_ADMIN_MANAGE_STATUS_VSH">
					<span class="GNAV_ADMIN_MANAGE_STATUS_VSHT">Current version status:</span>
					<span class="GNAV_ADMIN_MANAGE_STATUS_VSHVS"></span>
					<span class="GNAV_ADMIN_MANAGE_STATUS_VSHV"></span>
				</div>
				<div class="GNAV_ADMIN_MANAGE_STATUS_VS_setPending GNAV_ADMIN_MANAGE_STATUS_BTN">Set as pending</div>
				<div class="GNAV_ADMIN_MANAGE_STATUS_VS_publish GNAV_ADMIN_MANAGE_STATUS_BTN">Publish</div>
				<div class="GNAV_ADMIN_MANAGE_STATUS_VS_reject GNAV_ADMIN_MANAGE_STATUS_BTN">Reject version</div>
				<div class="GNAV_ADMIN_MANAGE_STATUS_VS_confirm disabled">
					<span class="GNAV_ADMIN_MANAGE_STATUS_VS_confirm_Y GNAV_ADMIN_MANAGE_STATUS_VSC">confirm</span>
					<span class="GNAV_ADMIN_MANAGE_STATUS_VS_confirm_N GNAV_ADMIN_MANAGE_STATUS_VSC">cancel</span>
				</div>
			</div>
			<div class="GNAV_ADMIN_MANAGE_STATUS_CLOSE">Close</div>
		</div>
			<div class="GNAV_ADMIN_MANAGE_STATUS_CNT_R">
				Explanation</br>
				<p>
				Surveys have three statuses:<br/>
				new: the survey is just added, nothing is done with it yet.<br/>
				publish: the survey is published on the site.<br/>
				hidden: the survey data remains hidden, but can be edited.<br/>
				</p>
				<p>
				Surveys have datasets with versions. These versions have their own statuses:<br/>
				new: the dataset is just added, but nothing has been done with it yet.<br/>
				in_process: the dataset is being worked on.<br/>
				pending_approval: the dataset is set for approval.<br/>
				publish: the dataset is approved and can be published on the site.<br/>
				</p>
				<p>
				Datasets that are rejected are removed completely from the database.<br/>
				</p>
			</div>
		</div>
	</div>
</template>
<template class="GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI_TPL">
	<li class="GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI">
		<span class="GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI_VS"></span>
		<span class="GNAV_ADMIN_MANAGE_STATUS_SUM_VSLI_VSSTAT"></span>
	</li>
</template>
<template class="GNAV_ADMIN_STATUS_RITM_TMPLT">
	<div class="GNAV_ADMIN_STATUS_RITM_C">
		<input type="radio" class="GNAV_ADMIN_STATUS_RITM"><span class="GNAV_ADMIN_STATUS_RITM_STAT"></span><span class="GNAV_ADMIN_STATUS_RITM_CNT"></span>
	</div>	
</template>	

		


        
        
	