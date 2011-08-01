


(function(){
	
var ie = (function(){
    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');
    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );
    return v > 4 ? v : undef;
}());

if(ie && ie<8){
	return false;	
}

// FUNCTION: Gets a Regex Object (regex) and returns its position/length on a String (text)
function regexIndexOfAndLength(text, regex, startpos) {
	var startpos = startpos || 0;
	var ocurrences = text.substring(startpos).match(regex)
	if(!ocurrences){return false;}
	var length = ocurrences[0].length	
	var indexOf = text.substring(startpos).search(regex);
	var info = {}
	info.position = (indexOf >= 0) ? (indexOf + (startpos)) : indexOf;
	info.length = length;
	info.final_position = info.position+info.length
	info.content = text.substring(info.position,info.final_position)
	return info;	
}




var container,
	html,
	offset = 0,
	tags  = [],
	currentRegexMatch,
	whitespaces_positions = [];




function createLineOffset(options){

	if(container != options.text)	{ 
		container = options.text;
		html = container.innerHTML;
		
		// [CH1]: Hide the HTML tags; converts all tags in whitespaces (to keep the length intact)
		while(currentRegexMatch = regexIndexOfAndLength(html,/\<(\S|\s)+?\>/gi,offset)){
			tags.push({
				start:		currentRegexMatch.position,
				end:		currentRegexMatch.final_position,
				length:		currentRegexMatch.length,
				content:	currentRegexMatch.content
			})
			offset = currentRegexMatch.length + currentRegexMatch.position;		
		}
		for(var i=0; i<tags.length;i++){
			var space = tags[i].content.replace(/\S|\s/gi," ")
			html = html.substring(0,tags[i].start) + space + html.substring(tags[i].end);
		}
		// [/CH1]
		
		//[CH2]: Creates an array with the positions of all whitespaces.
		offset = 0;
		while(currentRegexMatch=regexIndexOfAndLength(html,/\s+/gi,offset)){
			whitespaces_positions.push(currentRegexMatch.position);
			offset = currentRegexMatch.length + currentRegexMatch.position;		
		}
		//[CH2]
	
	} // End IF
	
	html = container.innerHTML;
	var width = options.width || 0;
	var side = options.side || "left";
	var line = options.line || 0;
	var HTMLlocator = '<span id="HTMLlocator">_</span>'
	i=0;
	var linesOffsets = [];
	var previousOffset = 0;
	var prev_html;
	while(i<whitespaces_positions.length){
		container.innerHTML = 	html.substring(0,whitespaces_positions[i]) 
								+ HTMLlocator 
								+ html.substring(whitespaces_positions[i]);								
		var offsetTop =  document.getElementById("HTMLlocator").offsetTop
		if(previousOffset != offsetTop){
			linesOffsets.push(offsetTop)	
			if(linesOffsets.length>line){
				var start_from_end = whitespaces_positions[i];
				var span = '<span style="float:'+side+';\
				 display:inline-block; height:1px; width:'+width+'px;"></span>';
 				 if(options.doble){
					 span += side=="left" ? 
					 	span.replace("left","right") : 
						span.replace("right","left"); 
				 }
				container.innerHTML = 	html.substring(0,start_from_end) 
										+ span 
										+ html.substring(start_from_end);
				var newCharsOffset = container.innerHTML.length - html.length
				for(i=i;i<whitespaces_positions.length;i++){
					whitespaces_positions[i] += newCharsOffset;
				}
				break;				
			}
			previousOffset = offsetTop;
		}
		prev_html = container.innerHTML;
		i++			
	}

}

window.irregularTextBox = function(options){
	if(!options || !options.text || !options.sizes){return false}	
	var offset = options.line || 0;	
	for(var j=0; j<options.sizes.length;j++){
		options.line = j + offset;
		options.width = options.sizes[j]
		createLineOffset(options)
	}
}


})();
