var express = require('express');
var router = express.Router();

var libxmljs = require("libxmljs");
var XMLPaths = ['./data/vast2.0_1.xml' , './data/vast2.0_2.xml'] ;
// var XMLPaths = ['./data/vast2.0_1.xml'] ;
var fs = require('fs')

var vast3_xml_arr = [];
var vast3_xml = "";
var temp_vast_xml = "";


router.get('/', function(req, res, next) {
  res.send('respond with a vast');
});

router.get('/vast3_xml_generation', function(req, res, next){


	vast3_xml = new libxmljs.Document('1.0','utf8');
	temp_vast_xml = vast3_xml.node('VAST').attr({version:'3.0' , 'xmlns:xsi':'http://www.w3.org/2001/XMLSchema-instance' , 'xsi:noNamespaceSchemaLocation':'vast.xsd'});
	
	XMLPaths.forEach(function(value, index){
		console.log("vast 2 xml file path : " , value);
		xml_parse_build(value , index);
	});

	temp_vast_xml = temp_vast_xml.parent(); //Ad
	vast3_xml = temp_vast_xml.toString(); 
	console.log("vast 3.0 xml : " , vast3_xml.toString());

	console.log("");
	console.log("");

	res.set('Content-Type', 'text/xml');
	res.send(vast3_xml) ;

});


function xml_parse_build(XMLPath , index){

	// console.log("index >> " , index);

	var xmlFile = fs.readFileSync(XMLPath, 'UTF-8');
	var xmlDoc = libxmljs.parseXmlString(xmlFile, { noblanks: true });

	var vast = xmlDoc.get('//VAST');
	var version = vast.attr('version').value();
	if (version != "2.0"){
		return null;
	}

	var Ad = xmlDoc.get('//Ad');
	var Ad_id = Ad.attr('id').value();
	console.log("Ad_id : " , Ad_id);	
	if (Ad_id == ""){
		return null;
	}

	temp_vast_xml = temp_vast_xml.node('Ad').attr({id : Ad_id , sequence : index+1 });
		temp_vast_xml = temp_vast_xml.node('InLine');
			AdSystem(xmlDoc);
				AdTitle(xmlDoc);
					Description(xmlDoc);
						Error(xmlDoc);
							Impression(xmlDoc);
							Creatives();
								Creative(xmlDoc); //Creative
									Linear(); //Linear
										Duration(xmlDoc); //Duration
										TrackingEvents(xmlDoc);
										VideoClicks(); //VideoClicks
											ClickThrough(xmlDoc); //ClickThrough
										temp_vast_xml = temp_vast_xml.parent(); //VideoClicks
										MediaFiles(xmlDoc); //MediaFiles
									temp_vast_xml = temp_vast_xml.parent(); //Linear
								temp_vast_xml = temp_vast_xml.parent(); //Creative
							temp_vast_xml = temp_vast_xml.parent(); //Creatives
		temp_vast_xml = temp_vast_xml.parent(); //InLine
	temp_vast_xml = temp_vast_xml.parent(); //Ad
}

function AdSystem(xmlDoc){
	var AdSystem = xmlDoc.get('//AdSystem');
	var AdSystem_version = AdSystem.attr('version').value();
	temp_vast_xml = temp_vast_xml.node('AdSystem','FreeWheel').attr({version : AdSystem_version});

	temp_vast_xml = temp_vast_xml.parent();
	console.log("AdSystem version - FreeWheel : " , AdSystem_version);
}

function AdTitle(xmlDoc){
	var AdTitle = xmlDoc.get('//AdTitle').text();
	temp_vast_xml = temp_vast_xml.node('AdTitle');
	temp_vast_xml = temp_vast_xml.cdata(AdTitle);
	temp_vast_xml = temp_vast_xml.parent();
	console.log("AdTitle : " , AdTitle);
}

function Description(xmlDoc){
	var Description = xmlDoc.get('//Description').text();
	temp_vast_xml = temp_vast_xml.node('Description');
	temp_vast_xml = temp_vast_xml.cdata(Description);
	temp_vast_xml = temp_vast_xml.parent();
	console.log("Description : " , Description);
}

function Error(xmlDoc){
	var Error = xmlDoc.get('//Error').text();
	temp_vast_xml = temp_vast_xml.node('Error');
	temp_vast_xml = temp_vast_xml.cdata(Error);
	temp_vast_xml = temp_vast_xml.parent();
	console.log("Error : " , Error);
} 							

function Impression(xmlDoc){
	var ImpressionArr = xmlDoc.find("//Impression");
	for (var i=0; i<ImpressionArr.length; i++){
		var ImpressionArr_id = ImpressionArr[i].attr('id').value();
		var ImpressionArr_text = ImpressionArr[i].text();
		temp_vast_xml = temp_vast_xml.node('Impression').attr({'id' : ImpressionArr_id });
		temp_vast_xml = temp_vast_xml.cdata(ImpressionArr_text);
		temp_vast_xml = temp_vast_xml.parent();
		console.log("Impression Id : " , ImpressionArr_id +" / text : "+ ImpressionArr_text );
	}
}

function Creatives(){
	temp_vast_xml = temp_vast_xml.node('Creatives');
}

function Creative(xmlDoc){
	var Creative = xmlDoc.get('//Creative');
	var Creative_sequence = Creative.attr('sequence').value();
	var Creative_id = Creative.attr('id').value();
	temp_vast_xml = temp_vast_xml.node('Creative').attr({'AdID' : Creative_id }); //Creative
	console.log("Creative_id : " , Creative_id );
}

function Linear(){
	temp_vast_xml = temp_vast_xml.node('Linear'); //Linear
}

	
function Duration(xmlDoc){
	var Duration = xmlDoc.get('//Duration').text();
	temp_vast_xml = temp_vast_xml.node('Duration' , Duration ); //Duration
	temp_vast_xml = temp_vast_xml.parent();
	console.log("Duration : " , Duration);
}

function TrackingEvents(xmlDoc){
	var TrackingEventsArr = xmlDoc.get('//TrackingEvents').childNodes();
	temp_vast_xml = temp_vast_xml.node('TrackingEvents'); //TrackingEvents
		for (var i=0; i<TrackingEventsArr.length; i++ ){
			if (TrackingEventsArr[i].name() == "Tracking"){
				var TrackingEvents_event = TrackingEventsArr[i].attr('event').value();
		   		var TrackingEvents_text = TrackingEventsArr[i].text();
		   		temp_vast_xml = temp_vast_xml.node('Tracking').attr({'event' : TrackingEvents_event });
		   		temp_vast_xml = temp_vast_xml.cdata(TrackingEvents_text);
		   		temp_vast_xml = temp_vast_xml.parent();
				console.log("TrackingEvents event : " , TrackingEvents_event +" / text : " + TrackingEvents_text );
			}
		}
	temp_vast_xml = temp_vast_xml.parent(); //TrackingEvents
}


function VideoClicks(){
	temp_vast_xml = temp_vast_xml.node('VideoClicks'); //VideoClicks
}

function ClickThrough(xmlDoc){
	var ClickThrough = xmlDoc.get('//ClickThrough').text();
	temp_vast_xml = temp_vast_xml.node('ClickTracking');
	temp_vast_xml = temp_vast_xml.cdata(ClickThrough);
	temp_vast_xml = temp_vast_xml.parent();
	console.log("ClickThrough  : " , ClickThrough);
}

function MediaFiles(xmlDoc){
	var MediaFilesArr = xmlDoc.get('//MediaFiles').childNodes();
	if (MediaFilesArr == null){
		return 
	}
	temp_vast_xml = temp_vast_xml.node('MediaFiles'); //MediaFiles
	console.log("MediaFilesArr size : " , MediaFilesArr.length );
		for (var i=0; i<MediaFilesArr.length; i++ ){
			if (MediaFilesArr[i].name() == "MediaFile"){
				MediaFile(MediaFilesArr[i]);
			}
		}
	temp_vast_xml = temp_vast_xml.parent(); //MediaFiles
}


function MediaFile(MediaFile){

	// var MediaFile = xmlDoc.get('//MediaFile');
	var MediaFile_delivery = MediaFile.attr('delivery').value();
	var MediaFile_bitrate = MediaFile.attr('bitrate').value();
	var MediaFile_width = MediaFile.attr('width').value();
	var MediaFile_height = MediaFile.attr('height').value();
	var MediaFile_type = MediaFile.attr('type').value();
	var MediaFile_text = MediaFile.text();
	console.log("MediaFile Prop / delivery: " , MediaFile_delivery 
				+" / bitrate : " +  MediaFile_bitrate 
				+" / width : " + MediaFile_width 
				+" / height : " + MediaFile_height 
				+" / type : " + MediaFile_type 
				+" / file : " + MediaFile_text 
				);
	temp_vast_xml = temp_vast_xml.node('MediaFile').attr({
										'delivery' : MediaFile_delivery , 
										'bitrate':  MediaFile_bitrate ,
										'width' : MediaFile_width ,   
										'height' : MediaFile_height ,  
										'type' : MediaFile_type
										});
	
	temp_vast_xml = temp_vast_xml.cdata(MediaFile_text);


	return temp_vast_xml = temp_vast_xml.parent(); //MediaFile
}







router.get('/vast_test', function(req, res, next){

	// var xml =  '<?xml version="1.0" encoding="UTF-8"?>' +
 //           '<root>' +
 //               '<child foo="bar">' +
 //                   '<grandchild baz="fizbuzz">grandchild content</grandchild>' +
 //               '</child>' +
 //               '<sibling>with content!</sibling>' +
 //           '</root>';
 
	// var xmlDoc = libxmljs.parseXml(xml);
	 
	// // xpath queries 
	// var gchild = xmlDoc.get('//grandchild');
	 
	// //console.log(gchild.text());  // prints "grandchild content" 
	 
	// var children = xmlDoc.root().childNodes();
	// //console.log("children >>>" , children); // prints "bar" 
	
	// var child = children[0];
	 
	// //console.log(child.attr('foo').value()); // prints "bar" 

	res.send('respond with a vast');    // echo the result back

});


module.exports = router;
