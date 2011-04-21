var w = 960,
pw = 14,
z = ~~((w - pw * 2) / 53),
ph = z >> 1,
h = z * 7;

var mindate="1720";
var maxdate="1729";
try {
    var queryString=decodeURIComponent(window.location.search.substring(1));
    
    if (queryString.length){
        
        var query=JSON.parse(queryString);        
        mindate=""+query.start;
        maxdate=""+query.finish;
        
    }
}catch(e){
    if (console&&console.log)
        console.log(e+" for "+queryString);
}
var vis = d3.select("#chart")
    .selectAll("svg")
    .data(d3.range(parseInt(mindate.substr(0,4)), 1+parseInt(maxdate.substr(0,4))))
    .enter().append("svg:svg")
    .attr("width", w)
    .attr("height", h + ph * 2)
    .attr("class", "RdGy")
    .append("svg:g")
    .attr("transform", "translate(" + pw + "," + ph + ")");

vis.append("svg:text")
    .attr("transform", "translate(-6," + h / 2 + ")rotate(-90)")
    .attr("text-anchor", "middle")
    .text(function(d) { return d; });
 
vis.selectAll("rect.day")
    .data(calendar.dates)
    .enter().append("svg:rect")
    .attr("x", function(d) { return d.week * z; })
    .attr("y", function(d) { return d.day * z; })
    .attr("class", "day")
    .attr("fill", "#fff")
    .attr("width", z)
    .attr("height", z);

vis.selectAll("path.month")
    .data(calendar.months)
    .enter().append("svg:path")
    .attr("class", "month")
    .attr("d", function(d) {
              return "M" + (d.firstWeek + 1) * z + "," + d.firstDay * z
                  + "H" + d.firstWeek * z
                  + "V" + 7 * z
                  + "H" + d.lastWeek * z
                  + "V" + (d.lastDay + 1) * z
                  + "H" + (d.lastWeek + 1) * z
                  + "V" + 0
                  + "H" + (d.firstWeek + 1) * z
                  + "Z";
          });
function requestDateChange(mindate,maxdate){
    
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4&&(xhr.status==200||xhr.status==0)) {
            var data=JSON.parse(xhr.responseText);
            /*
            var color = d3.scale.quantize()
                .domain([-.05, .05])
                .range(d3.range(9));
            */
            vis.selectAll("rect.day")
                .attr("class", function(d) { return "day q" + data[d.Date] + "-9";})
                .append("svg:title")
                .text(function(d) { return d.Date + ": " + data[d.Date]; });
        }
    };
    var requestObject={msg:"daterange",start:mindate,finish:maxdate};
    
    xhr.open("GET","query?q="+encodeURIComponent(JSON.stringify(requestObject)));
    return xhr.send();
}
requestDateChange(mindate,maxdate);
