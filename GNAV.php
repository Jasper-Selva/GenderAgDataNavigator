<?php
/**
* @package GNAV
* @version 0.6
Plugin name: GNAV
Description: The GNAV plugin creates a way to select and manage surveys with gender specific categorizations
Author: Jasper van der Hout
Version: 0.6
**/

define( 'WP_DEBUG_DISPLAY', false );
class GNAV_MAIN{
	// *************************************** //
	// the GNAV_MAIN class is the main class of the gender navigator.
	// it delegates tasks to the other php classes to do specific tasks.
	// *************************************** //

	protected $loader;
	protected $plugin_name;
	protected $version;
	protected $plugin_public;
	private $PLUGIN_GNAV_FILE;
	private $GNAV_dataprocessor;
	private $GNAV_XSLX_Reader;
	private $GNAV_CSS_FILE;
	private $GNAV_main_JS_FILE;
	private $GNAV_admin_JS_FILE;
	private $GNAV_MAIN_TEMPLATE;
	private $GNAV_PADMIN_TEMPLATE;
	function __construct(){
		defined( 'ABSPATH' ) or die( 'No direct access allowed!' );
		$this->plugin_name = 'GNAV';
		$this->version = '0.6.0';
		$this->dbPrefix ="";
		$this->abs_backup_path = plugin_dir_path( __FILE__ )."data_backup";
		
		$this->PLUGIN_GNAV_FILE = plugin_dir_path( __FILE__ );
		$this->GNAV_XSLX_Reader = $this->PLUGIN_GNAV_FILE . 'includes/GNAV_XLSX_READER.php';
		$this->GNAV_dataprocessor = $this->PLUGIN_GNAV_FILE . 'includes/GNAV_dataproc.php';
		$this->GNAV_db_creator = $this->PLUGIN_GNAV_FILE . 'includes/GNAV_db_create.php';
		$this->GNAV_CSS_FILE = $this->PLUGIN_GNAV_FILE . 'css/GNAV.css'; 
		$this->LEAFLET_CSS_FILE = $this->PLUGIN_GNAV_FILE . 'css/leaflet.css'; 
		$this->GNAV_main_JS_FILE = $this->PLUGIN_GNAV_FILE . 'js/GNAV.js';
		$this->GNAV_admin_JS_FILE = $this->PLUGIN_GNAV_FILE . 'js/GNAV_admin.js';
		$this->GNAV_MAIN_TEMPLATE = $this->PLUGIN_GNAV_FILE . 'template/GNAV_MAIN.php';
		$this->GNAV_PADMIN_TEMPLATE = $this->PLUGIN_GNAV_FILE . 'GNAV_PADMIN_TEMPLATE.php';
		$this->load_dependencies();
		$this->define_public_hooks();
		//$this->register_shortcodes();
	}
	// load dependencies
	private function load_dependencies(){
		require_once $this->GNAV_dataprocessor;
		require_once $this->GNAV_XSLX_Reader;
		$this->plugin_public = new GNAV_public( $this->get_plugin_name(), $this->get_version(), $this->GNAV_dataprocessor, $this->GNAV_XSLX_Reader, $this->dbPrefix );
	}
	private function define_public_hooks() {
		$this->plugin_public->register_styles();
		$this->plugin_public->register_scripts();
	}
	public function get_plugin_name() {
		return $this->plugin_name;
	}	
	public function get_version() {
		return $this->version;
	}
	public function get_loader(){
		return $this->loader;
	}
	public function run(){
		$this->loader->run();
	}
	public function show(){
		return $this->display_gender_navigator_public();
	}
	private function display_gender_navigator_public(){
		return $this->plugin_public->show();
	}
	public function activate(){
		# on activation of the plugin
		# define the actions here
		$this->create_db();
	}
	private function create_db(){
		# call the GNAV_db_creator to create the GNAV database.
		require_once $this->GNAV_db_creator;
		$myDBCreator = new GNAV_db_creator($this->abs_backup_path, $this->dbPrefix);
		$myDBCreator->GNAV_create_db();
	}
	public function fill_db(){
		# handle ajax requests from the settings page.
		require_once $this->GNAV_db_creator;
		check_ajax_referer( 'wp_gnav_padmin_nonce', 'security' );
		
		//$abs_backup_path = plugin_dir_path( __FILE__ )."data_backup";
		$myDBCreator = new GNAV_db_creator($this->abs_backup_path, $this->dbPrefix);
		
		
		if(isset($_POST["GNAV_PADMIN_INSERT_BASE_DATA"])){
			$res=$myDBCreator->GNAV_add_init_data();
			wp_send_json($res);
		}
		if(isset($_POST["GNAV_PADMIN_INSERT_DEFINITIONS"])){
			$res=$myDBCreator->GNAV_insert_defs();
			wp_send_json($res);
		}
		if(isset($_POST["GNAV_PADMIN_REMOVE_ALL_DATA"])){
			$res=$myDBCreator->GNAV_EMPTY();
			wp_send_json($res);
		}
		if(isset($_POST["GNAV_PADMIN_BACKUP_DATA"])){
			$res=$myDBCreator->write_backup();
			
			if(FALSE===$res){wp_send_json($res);}
			else{
				$dlfile=plugins_url("data_backup/".$res,  __FILE__);
				wp_send_json($dlfile);
			}
		}
		wp_send_json_error("error while processing request");
	}
	public function add_menu(){
		$opt_page = new GNAV_Options_page();
		error_log("add_menu");
	}
	public function getData(){
		check_ajax_referer( 'wp_gnav_nonce', 'security' );
		$myDProc = new GNAV_DATA_PROCESSOR($this->GNAV_XSLX_Reader, $this->dbPrefix);
		$myDProc->getMyData();
	}
	public function getLogin(){
		#send data for a wordpress login page to the browser
		check_ajax_referer( 'wp_gnav_nonce', 'security' );
		$myURL = get_permalink();
		if(isset($_POST["curURL"])){
			$myURL = $_POST["curURL"];
		}
		$args = array(
			'echo' => false,
			'redirect' => $myURL,
			'form_id' => 'loginform-GNAV',
			'label_username' => __( 'Username' ),
			'label_password' => __( 'Password' ),
			'label_remember' => __( 'Remember Me' ),
			'label_log_in' => __( 'Log In' ),
			'remember' => true
		);
		$data=wp_login_form( $args );
		wp_send_json ($data);
	}
}

class GNAV_Options_page{
	# handles requests for the settings page
	private $PLUGIN_GNAV_FILE;
	private $GNAV_PADMIN_TEMPLATE;
	private $GNAV_PADMIN_JS;
	private $JS;
	private $TMPLT;
	function __construct() {

		$this->PLUGIN_GNAV_FILE = plugin_dir_path( __FILE__ );
		
		$this->JS=[];
		$this->TMPLT=[];
		
		$this->JS[] = ["GNAV_PADMIN_JS", plugins_url('js/GNAV_padmin.js', __FILE__ )];
		$this->TMPLT[] = plugins_url('template/GNAV_PADMIN_TEMPLATE.php', __FILE__ );

		$this->register_script();
		add_action('admin_menu', array( $this, 'admin_menu' ) );
	}
	private function script_exist(){
		foreach($this->JS as $J){
			if(is_file($J[1])){error_log($J[0]." exists");}
			else{error_log($J[0]." does not exist!");}
		}
	}
	public function admin_menu() {
		add_options_page(
			'GNAV Settings',
			'GNAV Settings',
			'manage_options',
			'GNAV_settings_page_slug',
			array($this, 'settings_page')
		);
	}

	public function settings_page() {
		$admin_template = file_get_contents($this->TMPLT[0]);
		$this->enqueue_script();
		$this->localize_script($this->JS[0][0]);
		echo $admin_template;
	}

	private function localize_script($script_name){
	$params = array(
		'GNAV_ajax_url' => admin_url( 'admin-ajax.php' ),
		'ajax_nonce' => wp_create_nonce('wp_gnav_padmin_nonce'),
		'techdoc' => plugins_url('assets/downloads/Technical Documentation.pdf', __FILE__ )
		);
	wp_localize_script($script_name, 'GNAV_padmin_local', $params);	
	}
	private function register_script(){
		foreach($this->JS as $J){
			$res = wp_register_script( $J[0], $J[1], NULL, NULL, true );
		}
	}
	private function enqueue_script(){
		foreach($this->JS as $J){
			wp_enqueue_script($J[0]);
		}
	}
}

class GNAV_Loader{
	protected $actions;
	protected $filters;
	public function __construct(){
		$this->actions= array();
		$this->filters = array();
	}
	/**
	 * Add a new action to the collection to be registered with WordPress.
	 *
	 * @since    1.0.0
	 * @param    string               $hook             The name of the WordPress action that is being registered.
	 * @param    object               $component        A reference to the instance of the object on which the action is defined.
	 * @param    string               $callback         The name of the function definition on the $component.
	 * @param    int                  $priority         Optional. he priority at which the function should be fired. Default is 10.
	 * @param    int                  $accepted_args    Optional. The number of arguments that should be passed to the $callback. Default is 1.
	 */
	public function add_action( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
		$this->actions = $this->add( $this->actions, $hook, $component, $callback, $priority, $accepted_args );
	}
	/**
	 * Add a new filter to the collection to be registered with WordPress.
	 *
	 * @since    1.0.0
	 * @param    string               $hook             The name of the WordPress filter that is being registered.
	 * @param    object               $component        A reference to the instance of the object on which the filter is defined.
	 * @param    string               $callback         The name of the function definition on the $component.
	 * @param    int                  $priority         Optional. he priority at which the function should be fired. Default is 10.
	 * @param    int                  $accepted_args    Optional. The number of arguments that should be passed to the $callback. Default is 1
	 */
	public function add_filter( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
		$this->filters = $this->add( $this->filters, $hook, $component, $callback, $priority, $accepted_args );
	}
	/**
	 * A utility function that is used to register the actions and hooks into a single
	 * collection.
	 *
	 * @access   private
	 * @param    array                $hooks            The collection of hooks that is being registered (that is, actions or filters).
	 * @param    string               $hook             The name of the WordPress filter that is being registered.
	 * @param    object               $component        A reference to the instance of the object on which the filter is defined.
	 * @param    string               $callback         The name of the function definition on the $component.
	 * @param    int                  $priority         The priority at which the function should be fired.
	 * @param    int                  $accepted_args    The number of arguments that should be passed to the $callback.
	 * @return   array                                  The collection of actions and filters registered with WordPress.
	 */
	private function add( $hooks, $hook, $component, $callback, $priority, $accepted_args ) {
		$hooks[] = array(
			'hook'          => $hook,
			'component'     => $component,
			'callback'      => $callback,
			'priority'      => $priority,
			'accepted_args' => $accepted_args
		);
		return $hooks;
	}
	/**
	 * Register the filters and actions with WordPress.
	 */
	public function run() {
		foreach ( $this->filters as $hook ) {
			add_filter( $hook['hook'], array( $hook['component'], $hook['callback'] ), $hook['priority'], $hook['accepted_args'] );
		}
		foreach ( $this->actions as $hook ) {
			add_action( $hook['hook'], array( $hook['component'], $hook['callback'] ), $hook['priority'], $hook['accepted_args'] );
		}
	}
}
class GNAV_public{
	// class to perform tasks related to the 'public' part of the plugin
	// registers, enqueues the scripts
	// handles ajax requests
	
	private $plugin_name;
	private $version;
	private $styles_array;
	private $scripts_array;
	private $scripts_IE_array;
	private $templates_array;
	
	private $dataProcessor;
	private $xlsx_reader;
	private $GNAV_PREFIX = "";
	
	public function __construct($plugin_name, $version, $dataProcessor, $xlsx_reader, $dbPrefix){
		$this->plugin_name = $plugin_name;
		$this->version = $version;
		
		$this->dataProcessor = $dataProcessor;
		$this->xlsx_reader = $xlsx_reader;
		$this->GNAV_PREFIX = $dbPrefix;
		
		# the scripts, styles are stored in arrays
		# all scripts are registered
		# the 3rd term of the item is used to define whether a script is actually enqueued
		# the GNAV_select_JS_FILE is used to localize the script (send parameters along with the script)
		
		$this->styles_array = [];
		$this->scripts = [];
		$this->templates_array= [];
		$this->scripts_IE_array=[];
		
		$this->styles_array[]=['GNAV_style', plugins_url('css/GNAV.css', __FILE__ ),0];
		$this->styles_array[]=['LEAFLET_style', plugins_url('css/leaflet.css', __FILE__ ),0];
		
		$this->scripts_array[]= ['GNAV_main_JS_FILE', plugins_url('js/GNAV.js', __FILE__ ),0];
		$this->scripts_array[]= ['GNAV_select_JS_FILE', plugins_url('js/GNAV_select.js', __FILE__ ),0];
		$this->scripts_array[]= ['GNAV_admin_JS_FILE', plugins_url('js/GNAV_admin.js', __FILE__ ),1];
		$this->scripts_array[]= ['GNAV_user_admin_JS_FILE', plugins_url('js/GNAV_user_admin.js', __FILE__ ),2];
		$this->scripts_array[]= ['d3_queue_JS', 'https://d3js.org/d3-queue.v2.min.js',0];
		$this->scripts_array[]= ['bootstrap_JS', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js',0];
		$this->scripts_array[]= ['leaflet_JS', 'https://npmcdn.com/leaflet@0.7.7/dist/leaflet.js',0];
		$this->scripts_IE_array[]= ['html5shiv', plugins_url('js/html5shiv.min.js', __FILE__ ),0];
		
		$this->templates_array[]=['GNAV_MAIN_TEMPLATE',plugins_url('template/GNAV_MAIN.php', __FILE__ ),0];
		$this->templates_array[]=['GNAV_SELECT',plugins_url('template/GNAV_SELECT.php', __FILE__ ),0];
		$this->templates_array[]=['GNAV_SKELETON_NIE',plugins_url('template/GNAV_SKELETON_NIE.php', __FILE__ ),0];
		$this->templates_array[]=['GNAV_ADMIN_TEMPLATE',plugins_url('template/GNAV_ADMIN_TEMPLATE.php', __FILE__ ),1];
		$this->templates_array[]=['GNAV_USER_ADMIN_TEMPLATE',plugins_url('template/GNAV_USER_ADMIN_TEMPLATE.php', __FILE__ ),2];			
	}
	public function register_styles(){
		foreach($this->styles_array as &$style){
			$this->register_style($style[0],$style[1]);
		}
	}
	public function register_scripts(){
		foreach($this->scripts_array as $script){
			$this->register_script($script[0],$script[1]);
		}
		foreach($this->scripts_IE_array as $script){
			$this->register_script($script[0],$script[1]);
		}
	}
	public function show(){
		//show_admin_bar(false);
		$lvl_All = [['GNAV_user_admin_JS_FILE',2],['GNAV_USER_ADMIN_TEMPLATE',2],['GNAV_admin_JS_FILE',1],['GNAV_ADMIN_TEMPLATE',1]];
		$myUserRights = $this->getCurrentUserRights();
		$myLVL = 0;
		if(is_user_logged_in()){$myLVL = 1;}
		else{show_admin_bar(true);}
		
		if ($myUserRights->gnav_allow_mod_users==TRUE){$myLVL = 2;}
		$this->enqueue_styles($myLVL, $lvl_All);
		$this->enqueue_scripts($myLVL, $lvl_All);
		$this->localize_script($this->scripts_array[1][0]);
		$tpl = "";
		foreach($this->templates_array as &$template){
			if($myLVL>=$template[2]){
				$tpl .= file_get_contents($template[1]);
			}
		}
		return $tpl;
	}
	private function localize_script($script_name){
	$current_user = wp_get_current_user();
	$c_user_rights = $this->getCurrentUserRights();
	$params = array(
		'plugin_V'=>'GNAV_admin',
		'GNAV_ajax_url' => admin_url( 'admin-ajax.php' ),
		'ajax_nonce' => wp_create_nonce('wp_gnav_nonce'),
		'addIcon' => plugin_dir_url( __FILE__ ).('assets/img/icon_Add.png'),
		'removeIcon' => plugin_dir_url( __FILE__ ).('assets/img/icon_Remove.png'),
		'dataTemplate' => plugin_dir_url( __FILE__ ).('assets/downloads/GNavigator_datatemplate.xlsx'),
		'GNAV_ARROW_DOWN' => plugin_dir_url( __FILE__ ).('assets/img/arrow-down.png'),
		'logged_in' => is_user_logged_in(),
		'current_user_rights' => $c_user_rights,
		'current_user' => $current_user->user_login,
		'current_user_id'=>$current_user->ID
		);
	wp_localize_script($script_name, 'GNAV_admin_local', $params);	
	}
	private function getCurrentUserRights(){
		//defaults
		$c_user_rights = new stdClass();
		$c_user_rights ->gnav_allow_accept_reject = FALSE;
		$c_user_rights ->gnav_allow_mod_users = FALSE;
		
		if(is_user_logged_in()){
			$cur_user = wp_get_current_user();
			$myDProc = new GNAV_DATA_PROCESSOR($this->xlsx_reader, $this->GNAV_PREFIX);
			$c_user_rights = $myDProc->getUserRights($cur_user);
		}
		return $c_user_rights; 
	}
	private function enqueue_styles($lvl){
		foreach($this->styles_array as &$style){
			if($lvl>=$style[2]){
				wp_enqueue_style($style[0]);
			}
		}
	}
	private function enqueue_scripts($lvl){
		foreach($this->scripts_array as $script){
			if($lvl>=$script[2]){
				wp_enqueue_script($script[0]);
			}
		}
		$bname = $this->get_browser_name($_SERVER['HTTP_USER_AGENT']);
		if($bname=='Internet Explorer'){
			foreach($this->scripts_IE_array as $script){
				if($lvl>=$script[2]){
					wp_enqueue_script($script[0]);
				}
			}
		}
	}
	private function register_style($style_name, $style_file){
		wp_register_style( $style_name, $style_file, NULL, NULL,"all");
	}
	private function register_script($script_name, $script_url){
		wp_register_script( $script_name, $script_url, NULL, NULL, true );
	}
	private function get_browser_name($user_agent){
		if (strpos($user_agent, 'Opera') || strpos($user_agent, 'OPR/')) return 'Opera';
		elseif (strpos($user_agent, 'Edge')) return 'Edge';
		elseif (strpos($user_agent, 'Chrome')) return 'Chrome';
		elseif (strpos($user_agent, 'Safari')) return 'Safari';
		elseif (strpos($user_agent, 'Firefox')) return 'Firefox';
		elseif (strpos($user_agent, 'MSIE') || strpos($user_agent, 'Trident/7')) return 'Internet Explorer';
		
		return 'Other';
	}
}

function run_GNAV() {
	#general function to initialize the entire plugin. Defines shortcodes and actions.
	$plugin = new GNAV_MAIN();
	add_shortcode('wp_GNAV_NT', array($plugin,'show'));
	add_action('wp_ajax_gnav_proc', array($plugin, 'getData'));
	add_action('wp_ajax_nopriv_gnav_proc', array($plugin, 'getData'));
	add_action('wp_ajax_nopriv_gnav_login', array($plugin, 'getLogin'));
	add_action('wp_ajax_gnav_login', array($plugin, 'getLogin'));
	add_action('wp_ajax_gnav_padmin', array($plugin,  'fill_db'));
	register_activation_hook( __FILE__, array($plugin, 'activate'));
	$admin_plugin= new GNAV_Options_page();
	add_action('wp_ajax_gnav_padmin', array($plugin,  'fill_db'));
}
run_GNAV();
?>