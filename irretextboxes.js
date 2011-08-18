/*!
 * Creative Text Boxes 1.2
 * http://creativetextboxes.com/
 * Copyright 2011, Ivan Castellanos
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * Date: Thu Aug 16 00:00:00 2011 -0400
 */

(function(){

// [CH0] indexOf but using regex; it also returns length among other things.
function regexIndexOfAndLength(text, regex, startpos) {
	var startpos = startpos || 0;
	var ocurrences = text.substring(startpos).match(regex);
	if(!ocurrences){return false;}
	var length = ocurrences[0].length;
	var indexOf = text.substring(startpos).search(regex);
	var info = {};
	info.position = (indexOf >= 0) ? (indexOf + (startpos)) : indexOf;
	info.length = length;
	info.final_position = info.position+info.length;
	info.content = text.substring(info.position,info.final_position);
	return info;	
}
// [/CH0]


// [CH1] Returns a proportional average between two values. F is a number between 0 and 1
function proportionalAverage(v1,v2,f){
	if(f > 0 && (typeof v2 != "undefined")){
		return ((v2 * f) + (v1 * (1-f)));
	} else {
		return v1;
	}						
}
//[/CH1]


// [CH2]: Get current version of IE of user (public domain snippet thanks to james.padolsey.com)
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
// [/CH2]



//[CH3]: Main function (& only public one)
window.CreativeTextBox = function(options){
	
	if(!options || !options.text || (!options.leftSizes && !options.rightSizes ) || (!options.text.offsetWidth && !(options.text.get && jQuery)) || (ie && ie<7) ){return false;}
	if(typeof options.text.get == "function" && window.jQuery){options.text = options.text.get(0)}
	
	var container,
		html,
		offset = 0,
		tags  = [],
		currentRegexMatch,
		alreadyFixed = false,
		whitespaces_positions = [],
		previousWhitespaceUsed = 0, 	//	[CACHE] Use the last whitespace used to start from there and not from beginning of text
		previousLineModificated = 0, 	//	[CACHE] Use the last line modificated to start from there and not from beginning of text
		pixelDistance = options.pixelDistance || 40,
		HTMLlocator = '<span id="HTMLlocator" style="position:absolute; background:red" >.</span>',
		lineOffset = options.line || 0;
		
	options.leftSizes = options.leftSizes || [];
	options.rightSizes = options.rightSizes || [];	
	
	options.leftSizes = options.leftSizes.concat([]);
	options.rightSizes = options.rightSizes.concat([]);
		
	if(options.rightSizes.length>options.leftSizes.length){
		sizes = options.rightSizes;
		var side = "right"
	} else {
		sizes = options.leftSizes;
		var side = "left"
	}
	// [CH4]:Main loop (for every line)
					

	for(var j=0; j<sizes.length;j++){
		options.line = j + lineOffset;
		var loc = document.getElementById("HTMLlocator");
		if (loc){
			loc.parentNode.removeChild(loc);	
			break;
			
		}
		
		// [CH5]: This is only done once (for every call of creativeTextBox)
		if(container != options.text)	{ 
			container = options.text;
			html = container.innerHTML;
			
			// [CH6]: Hide the HTML tags; converts all tags in whitespaces (to keep the length intact)
			while(currentRegexMatch = regexIndexOfAndLength(html,/\<(\S|\s)+?\>/gi,offset)){
				tags.push({
					start:		currentRegexMatch.position,
					end:		currentRegexMatch.final_position,
					length:		currentRegexMatch.length,
					content:	currentRegexMatch.content
				});
				offset = currentRegexMatch.length + currentRegexMatch.position;		
			}
			for(var i=0; i<tags.length;i++){
				var space = tags[i].content.replace(/\S|\s/gi," ");
				html = html.substring(0,tags[i].start) + space + html.substring(tags[i].end);
			}
			// [/CH6]
			
			//[CH7]: Creates an array with the positions of all whitespaces.
			offset = 0;
			while(currentRegexMatch=regexIndexOfAndLength(html,/\s+/gi,offset)){
				whitespaces_positions.push(currentRegexMatch.position);
				offset = currentRegexMatch.length + currentRegexMatch.position;		
			}
			//[/CH7]
		
		}
		// [/CH5]
		
		html = container.innerHTML;
		
		
		var	line = options.line || 0,
			linesOffsetsCount = 0,
			previousOffset,
			prev_html;
		
		i = previousWhitespaceUsed;	
		

		
		/*[CH10] 	Traverse all the whitespaces using a dummy div (#HTMLlocator) to detect line breaks 
					and put the span(s) that create the offset if it is the line required.				
		 */
		while(i<whitespaces_positions.length){
			
			
			
			container.innerHTML = 	html.substring(0,whitespaces_positions[i]) 
									+ HTMLlocator 
									+ html.substring(whitespaces_positions[i]);								
									
			var loc = document.getElementById("HTMLlocator");
					
			if(loc){
				var offsetTop =  loc.offsetTop;
			} else {
				return false;				
			}
			if(previousOffset != offsetTop){
				linesOffsetsCount++;
				if(linesOffsetsCount>(line-previousLineModificated)){
					previousWhitespaceUsed = i;
					previousLineModificated = line;	
					
					var start_from_end = whitespaces_positions[i],
						realWidth,
						parentOffset = options.text.offsetTop,
						widthIndex = ((offsetTop-parentOffset)  /pixelDistance)-lineOffset,
						roundedDown = Math.floor(widthIndex),
						decimals = widthIndex - roundedDown,
						otherSide = sizes == options.rightSizes ? options.leftSizes : options.rightSizes,
						realWidth = 
						proportionalAverage(sizes[roundedDown],sizes[roundedDown+1],decimals),
						realWidthOtherSide = 
						proportionalAverage(otherSide[roundedDown],otherSide[roundedDown+1],decimals);
					
					
					/*[CH8] If the pixel distance is way too big compared to the line-height it requires 
					 a little fix forcing more iterations by inserting empty values in the array	*/
					if(sizes.length-1 == j && !alreadyFixed){
						alreadyFixed = true;
						var fixAmount = Math.ceil(pixelDistance / (offsetTop - previousOffset)*(sizes.length-1)) - sizes.length;
						var last = sizes[sizes.length-1];
						for(var k=0;k<fixAmount;k++){
							sizes.push(last)	
						}
					}
					// [CH8]
					
					var span = '<span style="float:'+side+'; display:block; min-height:1px; background:transparent;clear:'+side+'; width:'+realWidth+'px;"></span>';
					if(otherSide.length != 0 && realWidthOtherSide){
						var oth = span.replace(/width:.*px/,"width:"+realWidthOtherSide+"px");
						span += side=="left" ? 
							oth.replace(/left/gi,"right") : 
							oth.replace(/right/gi,"left"); 
					}else if(options.mirror && otherSide.length == 0){
						span += side=="left" ? 
							span.replace(/left/gi,"right"):
							span.replace(/right/gi,"left");
					}			
					
					/*
					// [CH9] IE 7 puts the floating element in the line after the required, fixing issue.
					if(ie<8){
						var lengthPreviousWord = 0;
						while(!/\s|>/.test(html.charAt(start_from_end-lengthPreviousWord-1))){
							if(start_from_end-lengthPreviousWord<0){break}
							lengthPreviousWord++;																								
						}
						start_from_end -= lengthPreviousWord;								
					}
					// [/CH9]
					*/
					
									
					if(typeof realWidth != "undefined" || typeof realWidthOtherSide != "undefined" ){					
						container.innerHTML = 	html.substring(0,start_from_end) 
												+ span 
												+ html.substring(start_from_end);
						
						var newCharsOffset = container.innerHTML.length - html.length;
						for(i=i;i<whitespaces_positions.length;i++){
							whitespaces_positions[i] = whitespaces_positions[i] + newCharsOffset;
						}
					}
					break;				
				}
				
				previousOffset = offsetTop;
			}
			prev_html = container.innerHTML;
			
			i++;			
		}//[CH10]
	}// [/CH4]
} // [/CH3]


})();
