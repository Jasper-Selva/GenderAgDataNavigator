<div id="GNAV_USER_ADMIN_CNT">
	<div id="GNAV_USER_LIST">
        <div id="GNAV_USER_LIST_HEAD">
            <span class="GNAV_USER_ADMIN_USER">User</span>
            <span class="GNAV_USER_ADMIN_user_allowed_accept GNAV_USER_ADMIN_CBSH" rid="acre">Accept/Reject</span>
            <span class="GNAV_USER_ADMIN_user_allowed_mod_users GNAV_USER_ADMIN_CBSH" rid="mous">Modify user rights</span>
        </div>
        <ul id="GNAV_USER_LIST_UL"></ul>
    </div>
	<div id="GNAV_USER_ADMIN_ACT">
		<div id="GNAV_USER_ADMIN_SEARCH">
			<div id="GNAV_USER_ADMIN_SEARCH_S">
				<span id="GNAV_USER_ADMIN_SEARCH_LABEL">Search user</span>
				<input type="text" id="GNAV_USER_ADMIN_SEARCH_INPUT"></input>
			</div>
			<ul id="GNAV_USER_ADMIN_SEARCH_R">
				<li class="GNAV_USER_ADMIN_SEARCH_res_default">search result</li>
			</ul>
			if a user is clicked, it will be added to the list of users where the rights permissions can be set. <br/>(if the user is already in the list, it will only be highlighted)
		</div>
		<div id="GNAV_USER_ADMIN_EXPLANATION">
			<div id="GNAV_USER_ADMIN_EXPH">Explanation of the user rights</div>
			<ul class="GNAV_USER_ADMIN_EXP_UL">
			<li class="GNAV_USER_ADMIN_EXP_LII">Every (logged in) user is allowed to upload surveys.</li>
			<li class="GNAV_USER_ADMIN_EXP_LII">Every (logged in) user is allowed to modify datasets if they are not published.</li>
			<li class="GNAV_USER_ADMIN_EXP_LII" rid="acre">Users with the Accept/Reject rights can set a survey as hidden or publish AND can accept or reject a survey dataset.</li>
			<li class="GNAV_USER_ADMIN_EXP_LII" rid="mous">Users with Modify user rights can change the user rights. <br/>(but some rights, like those of site admins, are not change-able).</li>
			</ul>
		</div>
	</div>
</div>
<template id="GNAV_USER_ADMIN_LISTITEM">
    <li class="GNAV_USER_ADMIN_LI">
        <span class="GNAV_USER_ADMIN_USER"></span>
        <span class="GNAV_USER_ADMIN_user_allowed_accept GNAV_USER_ADMIN_CBS"><input class= "GNAV_USER_ADMIN_CB" type="checkbox"/></span>
        <span class="GNAV_USER_ADMIN_user_allowed_mod_users GNAV_USER_ADMIN_CBS"><input class= "GNAV_USER_ADMIN_CB" type="checkbox"/></span>
        <span class="GNAV_USER_ADMIN_BUTTON_CHANGE">Change</span>
        <span class="GNAV_USER_ADMIN_BUTTON_CHANGE_CONFIRM GNAV_ADMIN_CONFREJ red">Confirm</span>
        <span class="GNAV_USER_ADMIN_BUTTON_CHANGE_CANCEL GNAV_ADMIN_CONFREJ green">Cancel</span>
    </li>
</template>
<template id="GNAV_USER_ADMIN_SURESLI">
    <li class="GNAV_USER_ADMIN_ULI">
        <span class="GNAV_USER_ADMIN_ULI_ID"></span>
        <span class="GNAV_USER_ADMIN_ULI_FNAME"></span>
        <span class="GNAV_USER_ADMIN_ULI_LNAME"></span>
        <span class="GNAV_USER_ADMIN_ULI_EMAIL"></span>
    </li>
</template>


