/**
* @NApiVersion 2.x
* @NScriptType Restlet
* @NModuleScope Public
*/

/* 

------------------------------------------------------------------------------------------
Script Information
------------------------------------------------------------------------------------------

Name:
File Cabinet API

ID:
_file_cabinet_api

Description
A RESTlet that serves as an RPC-style API to a NetSuite instance's File Cabinet.


------------------------------------------------------------------------------------------
Developer(s)
------------------------------------------------------------------------------------------

Tim Dietrich
• timdietrich@me.com
• https://timdietrich.me


------------------------------------------------------------------------------------------
History
------------------------------------------------------------------------------------------

20200826 - Tim Dietrich
• Initial version.


*/


var 
	file,	
	log,
	query,
	record;


define( [ 'N/file', 'N/log', 'N/query', 'N/record' ], main );


function main( fileModule, logModule, queryModule, recordModule ) {

	file = fileModule;
	log = logModule;
	query = queryModule;
	record = recordModule;
	
    return {
        post: postProcess
    }

}


function postProcess( request ) {

	if ( ( typeof request.function == 'undefined' ) || ( request.function == '' ) ) {
		return { 'error': 'No function was specified.' }
	}	
	
	switch ( request.function ) {
	
		case 'fileCreate':
			return fileCreate( request )
			break;		
			
		case 'fileEnumerationsGet':
			return file;
			break;
			
		case 'fileGet':
			return fileGet( request )
			break;						
			
		case 'folderCreate':
			return folderCreate( request )
			break;		
			
		case 'folderDelete':
			return folderDelete( request )
			break;												
						
		case 'requestEcho':
			return request;
			break;	
							
		case 'suiteQLRun':
			return suiteQLRun( request )
			break;																	
			
		default:
			var response = { 'error': 'Unsupported Function' }
			return response;
	
	}

}  

function fileCreate( request ) {

	// Validate the request...
	if ( typeof request.name == 'undefined' ) {
		return { 'error': 'No name was specified.' }
	}	
	if ( typeof request.fileType == 'undefined' ) {
		return { 'error': 'No fileType was specified.' }
	}			
	if ( typeof request.contents == 'undefined' ) {
		return { 'error': 'No content was specified.' }
	}	
	if ( typeof request.description == 'undefined' ) {
		return { 'error': 'No description was specified.' }
	}		
	if ( typeof request.encoding == 'undefined' ) {
		return { 'error': 'No encoding was specified.' }
	}	
	if ( typeof request.folderID == 'undefined' ) {
		return { 'error': 'No folderID was specified.' }
	}
	if ( typeof request.isOnline == 'undefined' ) {
		return { 'error': 'No isOnline was specified.' }
	}	
		
	// Load the file.
	try {
	
		var fileObj = file.create( 
			{
				name: request.name,
				fileType: request.fileType,
				contents: request.contents,
				description: request.description,
				encoding: request.encoding,
				folder: request.folderID,
				isOnline: request.isOnline
    		} 
		);
		
		// Save the file and get its ID.
		var fileID = fileObj.save();
		
		// Load the file.
		fileObj = file.load( { id: fileID } );
		
		// Create the response.
		var response = {};
		response['info'] = fileObj;
		response['content'] = fileObj.getContents();	

		return response;				
		
	} catch (e) {		
		return { 'error': e }			
	}	
	
}


function fileGet( request ) {

	// If no file ID was specified...
	if ( typeof request.fileID == 'undefined' ) {
		return { 'error': 'No fileID was specified.' }
	}	
		
	// Load the file.
	try {
	
		var fileObj = file.load( { id: request.fileID } );
		
		// Create the response.
		var response = {};
		response['info'] = fileObj;
		response['content'] = fileObj.getContents();	

		return response;				
		
	} catch (e) {		
		return { 'error': e }			
	}	
	
}

function folderCreate( request ) {	

	// If no folder name was specified...
	if ( typeof request.name == 'undefined' ) {
		return { 'error': 'No name was specified.' }
	}

	// Create the folder record.
	var objRecord = record.create(
		{
			type: record.Type.FOLDER,
			isDynamic: true
		}
	);
	
	// Set the folder name.
	objRecord.setValue( { fieldId: 'name', value: request.name } );
	
	// If this is a subfolder...
	if ( typeof request.parent !== 'undefined' ) {
		objRecord.setValue( { fieldId: 'parent', value: request.parent } );
	}
	
	// Save the record.
	var folderId = objRecord.save();
	
	// Get the record.
	result = record.load( { type: record.Type.FOLDER, id: folderId, isDynamic: false } );
	
	return result;

}

function folderDelete( request ) {	

	// If no folder ID was specified...
	if ( typeof request.folderID == 'undefined' ) {
		return { 'error': 'No folderID was specified.' }
	}

	try {
	
		// Load the record.
		var folder = record.load( 
			{ 
				type: record.Type.FOLDER, 
				id: request.folderID, 
				isDynamic: false 
			} 
		);
		
		// Delete the record.
		var objRecord = record.delete(
			{
				type: record.Type.FOLDER,
				id: request.folderID
			}
		);
		
		// Create the response.
		var response = {};
		response['folderDeleted'] = folder;		
	
		return response;
	
	} catch (e) {		
		return { 'error': e }			
	}	

}

function suiteQLRun( request ) {

	try {			
		var records = query.runSuiteQL( request['sql'] ).asMappedResults();		
		return { 'records': records }		
	} catch (e) {		
		return { 'error': e }			
	}			
		
} 

