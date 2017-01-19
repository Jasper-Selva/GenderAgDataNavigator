<div class="overlay">
	<div class="GNAV_spin_container"></div>
	<div class="GNAV_spin_status_container"></div>
</div>

<div id="GNAV_MAIN">
	<div id="GNAV_MAIN_SELECT_BAR" class="disabled" >
		<span class="GNAV_MAIN_BUTTON_HL"><span id="GNAV_MAIN_SELECT_SELECT" class="GNAV_MAIN_SELECT">Selector</span></span>
		<span class="GNAV_MAIN_BUTTON_HL"><span id="GNAV_MAIN_SELECT_DATA_ADMIN" class="GNAV_MAIN_SELECT">Data administration</span></span>
		<span class="GNAV_MAIN_BUTTON_HL"><span id="GNAV_MAIN_SELECT_USER_ADMIN" class="GNAV_MAIN_SELECT">User administration</span></span>
		<span class="GNAV_MAIN_BUTTON_HLP"><span id="GNAV_MAIN_SELECT_SHOW_HELP" class="GNAV_MAIN_SELECT">Show help</span></span>
	</div>
</div>
<div class="GNAV_MAIN_CONTEXT_HELP">
	<div id="GNAV_MAIN_CHELP_SELECTOR">
		<h3>selector</h3>
		<p>
			In the left panel ('Select Surveys by Categories') a selection can be made. The categories will expand until the values are shown<br/>
			Multiple selections within a single category will be treated as 'OR'. <br/>
			Selections in multiple categories will be treated as 'AND'.<br/>
		</p>
		<p>
			in the right panel ('Surveys') the results of the selection will be displayed. 
		</p>
		<h3>Surveys</h3>
		<p>
			In the right panel the resulting surveys will be displayed. If no selection has been made, or a selection results in no surveys, all surveys will be displayed.<br/>
			If a survey is clicked, some meta-data of the survey will be displayed in a panel below.<br/>
			On hovering over a survey, the criteria that match the survey will be highlighted and a popup will be shown with the criteria
		</p>
		<h3>Buttons</h3>
		<p>
			Below the survey list some options are given.<br/>
			Login: displayed only if a user is not logged in. This will show a small popup window to log in on the site. Users that are logged in get a 'data administration' option, and user admins get the 'user administration' option.
			
			Show context information: unselecting this will disable the context information popups.<br/>
			Reset selection: clicking this will reset the entire selection. 
		</p>
	</div>
	<div id="GNAV_MAIN_CHELP_DADMIN">
	<h3>Upload data</h3>
		<p>Download template file: clicking this will download an Excel file that can be used to upload the data for a single survey.</p>
		<p>Choose file: this gives the option to upload a filled in excel file for a survey.</p>
		<p>Upload file: Upload and process a selected file. Processing will take a little while, but depending on the server most likely less than a minute.</p>
	<h3>Manage data</h3>
		<p>
			Select a survey to show all the data in two panels (score data and meta data).<br/>
			Three buttons give the option to limit the number of surveys in the selector.
		</p>
		<p>
			Every change, addition or removal of a value will ask for confirmation. Once confirmed, the data will be updated in the database.<br/>
		</p>
		<p>
			Users with 'accept and reject' rights will also be shown two buttons to accept or reject an entire survey. Accepted surveys will get their status changed to 'publish'. Only surveys with the 'publish' status will be shown in the selector.<br/>
		</p>
		<p>
			To limit the amount of data shown, clicking the 'Score values' or 'Meta data' will show/hide the data in that category.<br/>
		</p>
	</div>
	<div id="GNAV_MAIN_CHELP_UADMIN">
	<h3>User administration</h3>
		<p>
			All the users with additional rights are shown in the list. <br/>
			
			To add a someone to the list, search the user in the bar. After a change is made and confirmed it will directly be updated in the database. <br/>
			(If the user is already on the page, there might be a discrepancy between the rights on the server and on the user site. Reloading the page will rectify this).
		</p>
	</div>
</div>

