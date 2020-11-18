
var credentials;
var secretKey;
var accessKey;
var sessionId;
var connect;

var uhListTable;
var userHierarchyDetailsList;
var uhLevelOne = [];
var uhLevelTwo = [];
var uhLevelThree = [];
var uhLevelFour = [];
var uhLevelFive = [];

var rpList;
var userHierarchyList;
var userHierarchyStructure;
var selectedGroupId;
var dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion, dlgInstanceId;
const GCREATE = 'CREATE';
const GMODIFY = 'MODIFY';
const GVOICE = 'VOICE';
const GCHAT = 'CHAT';
const GSTANDARD = 'STANDARD';

// allowed will be CREATE and MODIFY
var currentOperation = GCREATE;

$( document ).ready(function() {
    if (!checkCookie()) {
        setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
        setupAll();
    } else {
        setupAll();
        $( "#configDialog" ).dialog( "open" );
    }
});

function setupAll() {
    loadConnectAPIs();

    
    $("#listUH").click(() => {
        getListUserHierarchies();
    });
    $("#listUH2").click(() => {
        getListUserHierarchyGroups();
    });
    $("#describeUHS").click(() => {
    	getDescribeUserHierarchyStructure();
    });
    
    
    
    $("#btnRenameHierarchy").click(() => {
    	changeUserHierarchyGroupName();    	
    });
    $("#btnAddHierarchy").click(() => {
    	addUserHierarchyGroupName();    	
    });
    $("#btnSaveUHS").click(() => {
    	saveUserHierarchyStructure();    	
    });
    
    
    $("#manageUHS").click(() => {
    	setupUHStructure();
        $( "#uhStructureDialog" ).dialog( "open" );
    });
    
    $("#awsConfiguration").click(() => {
        $( "#configDialog" ).dialog( "open" );
    });
    
    $("#btnConfiguration").click(() => {
        if (saveCookie()) {
            $( "#configDialog" ).dialog( "close" );
        } else {
            $( "#configDialog" ).dialog( "open" );
        }
    });
       
    $("#dialog").dialog({
        autoOpen: false,
        modal: true
      });
    
    $("#resultDialog").dialog({
        autoOpen: false,
        modal: true
    });

    
    $('#configDialog').dialog({
        autoOpen: false,
        width: 850,
        modal: true,
        resizable: false,
        height: "auto"        
    });
    
    $('#uhStructureDialog').dialog({
        autoOpen: false,
        width: 850,
        modal: true,
        resizable: false,
        height: "auto"        
    });
    
    
    $('#addUHDialog').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        width: "auto",
        height: "auto",
        buttons: {
            "Yes": function() {
              $( this ).dialog( "close" );
              addUserHierarchy();
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
        }
    });
    
    
    $( "#confirmDialog" ).dialog({
        autoOpen: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Yes": function() {
            $( this ).dialog( "close" );
            deleteUserHierarchy();
          },
          Cancel: function() {
            $( this ).dialog( "close" );
          }
        }
    });
    
    $('#renameDialog').dialog({
        autoOpen: false,
        width: 800,
        height: "auto",
        modal: true
    });
    
    $('#addDialog').dialog({
        autoOpen: false,
        width: 800,
        height: "auto",
        modal: true
    });
        
    uhListTable = $('#uhListTable').DataTable({
        columnDefs: [
            {
                targets: -1,
                className: 'dt-body-right'
            }
          ],        
        columns: [{title: "Name"}],
        select: true,
        paging: false,
        info: false,
        searching: false
    });
    
    getDescribeUserHierarchyStructure();
        
}

function setupUHStructure(){
	if(userHierarchyStructure.HierarchyStructure.LevelOne)
		$("#dlgUHSLevelOne").val(userHierarchyStructure.HierarchyStructure.LevelOne.Name);
	if(userHierarchyStructure.HierarchyStructure.LevelTwo)
		$("#dlgUHSLevelTwo").val(userHierarchyStructure.HierarchyStructure.LevelTwo.Name) ;
	if(userHierarchyStructure.HierarchyStructure.LevelThree)
		$("#dlgUHSLevelThree").val(userHierarchyStructure.HierarchyStructure.LevelThree.Name) ;
	if(userHierarchyStructure.HierarchyStructure.LevelFour)
		$("#dlgUHSLevelFour").val(userHierarchyStructure.HierarchyStructure.LevelFour.Name) ;
	if(userHierarchyStructure.HierarchyStructure.LevelFive)
		$("#dlgUHSLevelFive").val(userHierarchyStructure.HierarchyStructure.LevelFive.Name);

}

async function saveUserHierarchyStructure(){
    try {
        handleWindow(true, '');
        var structure = {};
        if($('#dlgUHSLevelOne').val().length > 1)
            structure["LevelOne"] = {"Name" : $('#dlgUHSLevelOne').val()};
        if($('#dlgUHSLevelTwo').val().length > 1)
        	structure["LevelTwo"] = {"Name" : $('#dlgUHSLevelTwo').val()};
        if($('#dlgUHSLevelThree').val().length > 1)
        	structure["LevelThree"] = {"Name" : $('#dlgUHSLevelThree').val()};
        if($('#dlgUHSLevelFour').val().length > 1)
        	structure["LevelFour"] = {"Name" : $('#dlgUHSLevelFour').val()};
        if($('#dlgUHSLevelFive').val().length > 1)
        	structure["LevelFive"] = {"Name" : $('#dlgUHSLevelFive').val()};
        var l = await updateUserHierarchyStructure(dlgInstanceId, structure);
        handleWindow(false, '');
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
	
}


async function getDescribeUserHierarchyStructure(){
    try {
        handleWindow(true, '');
        userHierarchyStructure = await describeUserHierarchyStructure(dlgInstanceId);
        console.log(userHierarchyStructure);
        var uhs='User hierarcy structure : ';
        if(userHierarchyStructure.HierarchyStructure.LevelOne)
        	uhs= uhs + userHierarchyStructure.HierarchyStructure.LevelOne.Name ;
        if(userHierarchyStructure.HierarchyStructure.LevelTwo)
        	uhs = uhs + "/" + userHierarchyStructure.HierarchyStructure.LevelTwo.Name;
        if(userHierarchyStructure.HierarchyStructure.LevelThree)
        	uhs = uhs + "/" + userHierarchyStructure.HierarchyStructure.LevelThree.Name;
        if(userHierarchyStructure.HierarchyStructure.LevelFour)
        	uhs = uhs + "/" + userHierarchyStructure.HierarchyStructure.LevelFour.Name;
        if(userHierarchyStructure.HierarchyStructure.LevelFive)
        	uhs = uhs + "/" + userHierarchyStructure.HierarchyStructure.LevelFive.Name;
        
        $('#spnUHS').html(uhs);
        formatJSON(userHierarchyStructure, '#rpFormatted');
        handleWindow(false, '');
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}

async function getListUserHierarchies() {
    try {
        handleWindow(true, '');
        userHierarchyList = await listUserHierarchyGroups(dlgInstanceId);
        console.log(userHierarchyList);
        formatJSON(userHierarchyList, '#rpFormatted');
        handleWindow(false, '');
    } catch(e) {
	    console.log(e);        
	    handleWindow(false, '');
	    showResults(e);
    }
	
}
async function getListUserHierarchyGroups() {
    try {
        handleWindow(true, '');
        userHierarchyList = await listUserHierarchyGroups(dlgInstanceId);
        console.log(userHierarchyList);
        formatJSON(userHierarchyList, '#rpFormatted');
        var uhLevelOne = '<div class="structure">' + userHierarchyStructure.HierarchyStructure.LevelOne.Name + '</div>';
        userHierarchyDetailsList = [];
        for (var i=0; i< userHierarchyList.UserHierarchyGroupSummaryList.length; i++) {
            var l = await describeUserHierarchyGroup(dlgInstanceId, userHierarchyList.UserHierarchyGroupSummaryList[i].Id)            
            console.log(l);
            userHierarchyDetailsList.push(l);
        }
        loadHierarchy("1");
        handleWindow(false, '');
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}

function loadHierarchy(level, parentGroupId, parentName) {
    var uhLevel = "";
    var uhStructure="";
    var addNewGroup ="";
    var uhHierarchy = "";
    var uhParentGroupDetails;
    var uhChildGroupId="";
    var uhStructureName = "";
    try{
    	if(parseInt(level)>5)
    		return;
	    for(var i=0; i < userHierarchyDetailsList.length; i++) {
	    	var l = userHierarchyDetailsList[i];
	    	if(l.HierarchyGroup.LevelId === level) {
	    		var groupId = l.HierarchyGroup.Id;
	    		var pGroupId="";
	    		if(level === "1") {
	    			pGroupId = l.HierarchyGroup.HierarchyPath.LevelOne.Id;
	    			uhChildGroupId = l.HierarchyGroup.HierarchyPath.LevelOne.Id;
	    			uhStructureName = l.HierarchyGroup.HierarchyPath.LevelOne.Name
	    		}    			
	    		if(level === "2") {
	    			pGroupId = l.HierarchyGroup.HierarchyPath.LevelOne.Id;
	    			uhChildGroupId = l.HierarchyGroup.HierarchyPath.LevelTwo.Id;
	    			uhStructureName = l.HierarchyGroup.HierarchyPath.LevelTwo.Name
	    		}
	    			
	    		if(level === "3") {
	    			pGroupId = l.HierarchyGroup.HierarchyPath.LevelTwo.Id;
	    			uhChildGroupId = l.HierarchyGroup.HierarchyPath.LevelThree.Id;
	    			uhStructureName = l.HierarchyGroup.HierarchyPath.LevelThree.Name
	    		}
	    			
	    		if(level === "4") {
	    			pGroupId = l.HierarchyGroup.HierarchyPath.LevelThree.Id;
	    			uhChildGroupId = l.HierarchyGroup.HierarchyPath.LevelFour.Id;
	    			uhStructureName = l.HierarchyGroup.HierarchyPath.LevelFour.Name
	    		}
	    			
	    		if(level === "5") {
	    			pGroupId = l.HierarchyGroup.HierarchyPath.LevelFour.Id;
	    			uhChildGroupId = l.HierarchyGroup.HierarchyPath.LevelFive.Id;
	    			uhStructureName = l.HierarchyGroup.HierarchyPath.LevelFive.Name
	    		}
	    			
	    		
	    		if(parentGroupId) {
	    			if(parentGroupId === pGroupId) {
	    	    		uhParentGroupDetails =l;
	    	    		var groupName = '<a href="" onclick="loadHierarchy(\'' + (parseInt(level) + 1 )  + '\' , \'' + uhChildGroupId + '\',\'' + uhStructureName + '\');return false;">' + l.HierarchyGroup.Name + '</a></span>';
	            		var renameLink = '<span class="spnRenameDelete"><a href="" onclick="handleRenameWindow(\'' + groupId + '\',\'' + l.HierarchyGroup.Name + '\',\'' + level + '\');return false;">Rename</a> / ';
	            		var deleteLink = '<a href="" onclick="deleteUserHierarchyConfirmation(\'' + groupId + '\');return false;">Delete</a></span>';
	            		uhLevel += '<div class="structureChild" groupId="' + groupId + '">' + groupName + renameLink + deleteLink + '</div>';  
	    			}
	    		}else {
	        		uhParentGroupDetails =l;
	        		var groupName = '<a href="" onclick="loadHierarchy(\'' + (parseInt(level) + 1 )  + '\' , \'' + uhChildGroupId + '\',\'' + uhStructureName + '\');return false;">' + l.HierarchyGroup.Name + '</a></span>';
	        		var renameLink = '<span class="spnRenameDelete"><a href="" onclick="handleRenameWindow(\'' + groupId + '\',\'' + l.HierarchyGroup.Name + '\',\'' + level + '\');return false;">Rename</a> / ';
	        		var deleteLink = '<a href="" onclick="deleteUserHierarchyConfirmation(\'' + groupId + '\');return false;">Delete</a></span>';
	        		uhLevel += '<div class="structureChild" groupId="' + groupId + '">' + groupName + renameLink + deleteLink + '</div>';  
	    		}
	    	}
	    }
	    if(uhParentGroupDetails) {
	    	
			if(level === "1") {
				uhStructure = '<div class="structure">' + userHierarchyStructure.HierarchyStructure.LevelOne.Name + '</div>';
			    addNewGroup = '</br><div><a href="" onclick="addNewGroup(\'\');return false;">Add ' + userHierarchyStructure.HierarchyStructure.LevelOne.Name + '</a></div>';
				uhHierarchy= '<div class="hierarchy"><a href="" onclick="loadHierarchy(\'1\');return false;">-</a></div>';
			}
			if(level === "2") {
				uhStructure = '<div class="structure">' + userHierarchyStructure.HierarchyStructure.LevelOne.Name + '/' + userHierarchyStructure.HierarchyStructure.LevelTwo.Name + '</div>';
			    addNewGroup = '</br><div><a href="" onclick="addNewGroup(\'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelOne.Id + '\');return false;">Add ' + userHierarchyStructure.HierarchyStructure.LevelTwo.Name + '</a></div>';
				uhHierarchy = '<div class="hierarchy"><a href="" onclick="loadHierarchy(\'1\');return false;">-</a> / ';
				uhHierarchy += '<a href="" onclick="loadHierarchy(\'2\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelOne.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelOne.Name + '</a> / ';
				uhHierarchy += '</div>';
			}
			if(level === "3") {
				uhStructure = '<div class="structure">' + userHierarchyStructure.HierarchyStructure.LevelOne.Name + '/' + userHierarchyStructure.HierarchyStructure.LevelTwo.Name +  '/' + userHierarchyStructure.HierarchyStructure.LevelThree.Name + '</div>';
			    addNewGroup = '</br><div><a href="" onclick="addNewGroup(\'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelTwo.Id + '\');return false;">Add ' + userHierarchyStructure.HierarchyStructure.LevelThree.Name + '</a></div>';
			    uhHierarchy = '<div class="hierarchy"><a href="" onclick="loadHierarchy(\'1\');return false;">-</a> / ';
			    uhHierarchy += '<a href="" onclick="loadHierarchy(\'2\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelOne.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelOne.Name + '</a> / ';
				uhHierarchy += '<a href="" onclick="loadHierarchy(\'3\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelTwo.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelTwo.Name + '</a> / '
				uhHierarchy += '</div>';
				
			}
			if(level === "4") {
				uhStructure = '<div class="structure">' + userHierarchyStructure.HierarchyStructure.LevelOne.Name + '/' + userHierarchyStructure.HierarchyStructure.LevelTwo.Name + '/' + userHierarchyStructure.HierarchyStructure.LevelThree.Name + '/' + userHierarchyStructure.HierarchyStructure.LevelFour.Name  + '</div>';
			    addNewGroup = '</br><div><a href="" onclick="addNewGroup(\'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelThree.Id + '\');return false;">Add ' + userHierarchyStructure.HierarchyStructure.LevelFour.Name + '</a></div>';
			    uhHierarchy = '<div class="hierarchy"><a href="" onclick="loadHierarchy(\'1\');return false;">-</a> / ';
			    uhHierarchy += '<a href="" onclick="loadHierarchy(\'2\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelOne.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelOne.Name + '</a> / ';
				uhHierarchy += '<a href="" onclick="loadHierarchy(\'3\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelTwo.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelTwo.Name + '</a> / '
				uhHierarchy += '<a href="" onclick="loadHierarchy(\'4\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelThree.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelThree.Name + '</a> / '
				uhHierarchy += '</div>';
		
			}
			if(level === "5") {
				uhStructure = '<div class="structure">' + userHierarchyStructure.HierarchyStructure.LevelOne.Name + '/' + userHierarchyStructure.HierarchyStructure.LevelTwo.Name + '/' + userHierarchyStructure.HierarchyStructure.LevelThree.Name + '/' + userHierarchyStructure.HierarchyStructure.LevelFour.Name + '/' + userHierarchyStructure.HierarchyStructure.LevelFive.Name + '</div>';
			    addNewGroup = '</br><div><a href="" onclick="addNewGroup(\'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelFour.Id + '\');return false;">Add ' + userHierarchyStructure.HierarchyStructure.LevelFive.Name + '</a></div>';
			    uhHierarchy = '<div class="hierarchy"><a href="" onclick="loadHierarchy(\'1\');return false;">-</a> / ';
			    uhHierarchy += '<a href="" onclick="loadHierarchy(\'2\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelOne.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelOne.Name + '</a> / ';
				uhHierarchy += '<a href="" onclick="loadHierarchy(\'3\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelTwo.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelTwo.Name + '</a> / '
				uhHierarchy += '<a href="" onclick="loadHierarchy(\'4\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelThree.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelThree.Name + '</a> / '
				uhHierarchy += '<a href="" onclick="loadHierarchy(\'5\', \'' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelFour.Id + '\');return false;">' + uhParentGroupDetails.HierarchyGroup.HierarchyPath.LevelFour.Name + '</a> / '
				uhHierarchy += '</div>';
			    
			}
	    }else{
	    	var l = parseInt(level); 
	    	if( l === 1)
	    		uhStructure = userHierarchyStructure.HierarchyStructure.LevelOne.Name;
	    	else if( l === 2)
		    		uhStructure = userHierarchyStructure.HierarchyStructure.LevelTwo.Name;
	    	else if( l === 3)
	    		uhStructure = userHierarchyStructure.HierarchyStructure.LevelThree.Name;
	    	else if( l === 4)
	    		uhStructure = userHierarchyStructure.HierarchyStructure.LevelFour.Name;
	    	else if( l === 5)
	    		uhStructure = userHierarchyStructure.HierarchyStructure.LevelFive.Name;

	        if(parentGroupId === undefined || !parentGroupId) {
	        	parentGroupId = "";
	        }
	        if(parentName === undefined || !parentName) {
	        	parentName = "";
	        }    
	    		
	    	addNewGroup = '</br><div><a href="" onclick="addNewGroup(\'' + parentGroupId + '\');return false;">Add ' + uhStructure + '</a></div>';	
	    	uhStructure = '<div class="structure">' + $('.structure').text() + '/' + uhStructure + '</div>';	    	
	    	$('.hierarchy').append('<a href="" onclick="loadHierarchy(\'' + level + '\');return false;">' + parentName  + '</a></div>');
	    	if($('.hierarchy').html() === undefined || $('.hierarchy').html() === "undefined") {
	    		uhHierarchy = '<div class="hierarchy">-</div>';
	    	} else {
	    		uhHierarchy = '<div class="hierarchy">' + $('.hierarchy').html() + '</div>';	
	    	}
	    	
	    }
	    var uhAll = uhStructure + uhHierarchy + uhLevel + addNewGroup;
	    if(uhAll.length > 1)
	    	$('#divContainer').html(uhAll);

    }catch(e){
    	console.log(e);
    }
	
}

function handleRenameWindow(groupId, oldName, level){
	$('#dlgOldName').val(oldName);
	$('#dlgGroupId').val(groupId);	
	$('#dlgGroupLevel').val(level);
	$( "#renameDialog" ).dialog( "open" );
}

function addNewGroup(groupId){
	$('#dlgGroupIdNew').val(groupId);	
	$( "#addDialog" ).dialog( "open" );
}

async function changeUserHierarchyGroupName(){
	try{
        handleWindow(true, '');
        var groupId = $('#dlgGroupId').val();
        var groupName = $('#dlgNewName').val();
        var level = $('#dlgGroupLevel').val();
        var l = await updateUserHierarchyGroupName(dlgInstanceId, groupId, groupName);
        console.log(l);
        for(var i=0; i < userHierarchyDetailsList.length; i++){
        	var uh = userHierarchyDetailsList[i];
        	if(userHierarchyDetailsList[i].HierarchyGroup.Id === groupId){
        		uh.HierarchyGroup.Name = groupName;
        		if(level === "1")
        			userHierarchyDetailsList[i].HierarchyGroup.HierarchyPath.LevelOne.Name = groupName;
        		if(level === "2")
        			userHierarchyDetailsList[i].HierarchyGroup.HierarchyPath.LevelTwo.Name = groupName;
        		if(level === "3")
        			userHierarchyDetailsList[i].HierarchyGroup.HierarchyPath.LevelThree.Name = groupName;
        		if(level === "4")
        			userHierarchyDetailsList[i].HierarchyGroup.HierarchyPath.LevelFour.Name = groupName;
        		if(level === "5")
        			userHierarchyDetailsList[i].HierarchyGroup.HierarchyPath.LevelFive.Name = groupName;
        	}else{
        		if(uh.HierarchyGroup.HierarchyPath.LevelOne && uh.HierarchyGroup.HierarchyPath.LevelOne.Id === groupId){
        			uh.HierarchyGroup.HierarchyPath.LevelOne.Name = groupName;
        		}else if(uh.HierarchyGroup.HierarchyPath.LevelTwo && uh.HierarchyGroup.HierarchyPath.LevelTwo.Id === groupId){
        			uh.HierarchyGroup.HierarchyPath.LevelTwo.Name = groupName;
        		}else if(uh.HierarchyGroup.HierarchyPath.LevelThree && uh.HierarchyGroup.HierarchyPath.LevelThree.Id === groupId){
        			uh.HierarchyGroup.HierarchyPath.LevelThree.Name = groupName;
        		}else if(uh.HierarchyGroup.HierarchyPath.LevelFour && uh.HierarchyGroup.HierarchyPath.LevelFour.Id === groupId){
        			uh.HierarchyGroup.HierarchyPath.LevelFour.Name = groupName;
        		}else if(uh.HierarchyGroup.HierarchyPath.LevelFive && uh.HierarchyGroup.HierarchyPath.LevelFive.Id === groupId){
        			uh.HierarchyGroup.HierarchyPath.LevelFive.Name = groupName;
        		}
        	}
        }
        handleWindow(false, '');
        $( "#renameDialog" ).dialog( "close" );
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
}

async function addUserHierarchyGroupName() {
	try{
        handleWindow(true, '');
        var groupId=$('#dlgGroupIdNew').val(); 
        if(!groupId || groupId === undefined || groupId === "undefined") {
        	groupId	="";
        }
        var l = await createUserHierarchyGroup(dlgInstanceId, $('#dlgAddName').val(), groupId);
        console.log(l);
        getListUserHierarchyGroups();
        $( "#addDialog" ).dialog( "close" );
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
}

function deleteUserHierarchyConfirmation(groupId) {
	selectedGroupId = groupId;
	$( "#confirmDialog" ).dialog('open');
}

async function deleteUserHierarchy(){
	try{
        handleWindow(true, '');
        var l = await deleteUserHierarchyGroup(dlgInstanceId, selectedGroupId);
        console.log(l);
        getListUserHierarchyGroups();
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
	
}

const listUserHierarchyGroups = (instanceId) => {
    return new Promise((resolve,reject) => {
        var params = {InstanceId : instanceId};       
        console.log(params);
        connect.listUserHierarchyGroups(params, function (err, res) {        
             if (err) 
                  reject(err);
              else 
                 resolve(res);
         });
     });
 }

const createUserHierarchyGroup = (instanceId, name, parentGroupId) => {
    return new Promise((resolve,reject) => {
           var params = {InstanceId : instanceId, Name : name, ParentGroupId : parentGroupId};       
           console.log(params);
           connect.createUserHierarchyGroup(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const updateUserHierarchyGroupName = (instanceId, hierarchyGroupId, name) => {
    return new Promise((resolve,reject) => {
       var params = {Name : name, HierarchyGroupId : hierarchyGroupId, InstanceId : instanceId};       
       console.log(params);
       connect.updateUserHierarchyGroupName(params, function (err, res) {        
            if (err) 
                 reject(err);
             else 
                resolve(res);
        });
    });
}


const deleteUserHierarchyGroup = (instanceId, hierarchyGroupId) => {
    return new Promise((resolve,reject) => {
       var params = {InstanceId : instanceId, HierarchyGroupId : hierarchyGroupId};       
       console.log(params);
       connect.deleteUserHierarchyGroup(params, function (err, res) {        
            if (err) 
                 reject(err);
             else 
                resolve(res);
        });
    });
}

//This provides the template for the hierarchies
const describeUserHierarchyStructure = (instanceId) => {
    return new Promise((resolve,reject) => {
       var params = {InstanceId : instanceId};       
       console.log(params);
       connect.describeUserHierarchyStructure(params, function (err, res) {        
            if (err) 
                 reject(err);
             else 
                resolve(res);
        });
    });
}

const describeUserHierarchyGroup = (instanceId, hierarchyGroupId ) => {
    return new Promise((resolve,reject) => {
        var params = {InstanceId : instanceId, HierarchyGroupId : hierarchyGroupId };       
        console.log(params);
        connect.describeUserHierarchyGroup(params, function (err, res) {        
             if (err) 
                  reject(err);
              else 
                 resolve(res);
         });
     });
 }

const updateUserHierarchyStructure = (instanceId, hierarchyStructure ) => {
    return new Promise((resolve,reject) => {
        var params = {InstanceId : instanceId, HierarchyStructure : hierarchyStructure };       
        console.log(params);
        connect.updateUserHierarchyStructure(params, function (err, res) {        
             if (err) 
                  reject(err);
              else 
                 resolve(res);
         });
     });
 }


function showResults(message){
    $('#resultSpan').text(message);
    $("#resultDialog").dialog("open");
}

function loadConnectAPIs() {
	connect = new AWS.Connect({ region: "us-west-2", endpoint: "https://91am9nwnzk.execute-api.us-west-2.amazonaws.com/Prod" }, {apiVersion: '2017-08-08'});
}


function handleWindow(openClose, text) {
    if(openClose == true) {
        $( "#dialog" ).dialog( "open" );
    } else {
        $( "#dialog" ).dialog( "close" );
    }

    if(text.length>1) {
        $('#waitingSpan').text(text);
    } else {
        $('#waitingSpan').text('    Waiting for server to respond');
    }
}

function setAWSConfig(accessKey, secretKey, rgn) {

    AWS.config.update({
        accessKeyId: accessKey, secretAccessKey: secretKey, region: rgn
    });    
    AWS.config.credentials.get(function (err) {
        if (err)
            console.log(err);
        else {
            credentials = AWS.config.credentials;
            getSessionToken();
        }
    });
    
}

function formatJSON(data, element) {
    $(element).html(prettyPrintJson.toHtml(data));
}


function getSessionToken() {
    var sts = new AWS.STS();
    sts.getSessionToken(function (err, data) {
      if (err) console.log("Error getting credentials");
      else {
          secretKey = data.Credentials.SecretAccessKey;
          accessKey = data.Credentials.AccessKeyId;
          sessionId = data.Credentials.SessionToken;
      }
    });
}

function clear_form_elements(ele) {
    $(':input',ele)
      .not(':button, :submit, :reset')
      .val('')
      .prop('checked', false)
      .prop('selected', false);
}

function saveCookie() {
    dlgSourceAccessKey=$("#dlgSourceAccessKey").val();
    dlgSourceSecretKey=$("#dlgSourceSecretKey").val();
    dlgSourceRegion=$("#dlgSourceRegion").val();
    dlgInstanceId = $("#dlgInstanceId").val();
    if(!checkAllMandatoryFields()) {
        setCookie("dlgSourceAccessKey", dlgSourceAccessKey,100);
        setCookie("dlgSourceSecretKey", dlgSourceSecretKey,100 );
        setCookie("dlgSourceRegion", dlgSourceRegion,100);
        setCookie("dlgInstanceId", dlgInstanceId,100);
        $('#spnAWSMessage').text('');
        setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
        return true;
    }else{
        $('#spnAWSMessage').text('All fields are mandatory and cannot be whitespaces or null');        
        return false;
    }
}

function getCookie(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x===c_name)
        {
          return unescape(y);
        }
     }
}

function setCookie(c_name,value,exdays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

function checkCookie()
{
    dlgSourceAccessKey=getCookie("dlgSourceAccessKey");
    dlgSourceSecretKey=getCookie("dlgSourceSecretKey");
    dlgSourceRegion=getCookie("dlgSourceRegion");
    dlgInstanceId=getCookie("dlgInstanceId");
    $('#dlgSourceAccessKey').val(dlgSourceAccessKey);
    $('#dlgSourceSecretKey').val(dlgSourceSecretKey);
    $('#dlgSourceRegion').val(dlgSourceRegion);
    $('#dlgInstanceId').val(dlgInstanceId);
    return checkAllMandatoryFields();
}

function checkAllMandatoryFields() {
    if(isBlank(dlgSourceAccessKey) || dlgSourceAccessKey.isEmpty() || 
            isBlank(dlgSourceSecretKey) || dlgSourceSecretKey.isEmpty() || 
            isBlank(dlgSourceRegion) || dlgSourceRegion.isEmpty() ||
            isBlank(dlgInstanceId) || dlgInstanceId.isEmpty()
            ) {
        return true;
    }else
        return false;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};