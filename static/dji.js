var w=960;
{
   
/* Scales and sizing. */
var h1 = 1,
    hmid = 0,
    h2 = 30,
    x = pv.Scale.linear(start, end).range(0, w),
    y = pv.Scale.linear(0, pv.max(data, function(d) {return d.y;})).range(0, h2);

/* Interaction state. Focus scales will have domain set on-render. */
var i = {x:200, dx:100},
    fx = pv.Scale.linear().range(0, w),
    fy = pv.Scale.linear().range(0, h1);

/* Root panel. */

    xvis.width(w)
    .height(h1 + hmid + h2);

/* Context panel (zoomed out). */
var context = xvis.add(pv.Panel)
    .bottom(0)
    .height(h2);

/* X-axis ticks. */
context.add(pv.Rule)
    .data(x.ticks())
    .left(x)
    .strokeStyle("#eee")
  .anchor("bottom").add(pv.Label)
    .text(x.tickFormat);

/* Y-axis ticks. */
context.add(pv.Rule)
    .bottom(0);

/* Context area chart. */
context.add(pv.Area)
    .data(data)
    .left(function(d) {return x(d.x);})
    .bottom(1)
    .height(function(d) {return y(d.y);})
    .fillStyle("lightsteelblue")
  .anchor("top").add(pv.Line)
    .strokeStyle("steelblue")
    .lineWidth(2);
var TEST=function(a) {
console.log("TEST "+JSON.stringify(a));
}
/* The selectable, draggable focus region. */
context.add(pv.Panel)
    .data([i])
    .cursor("crosshair")
    .events("all")
    .event("mousedown", pv.Behavior.select())
    .event("select", TEST)
  .add(pv.Bar)
    .left(function(d) {return d.x;})
    .width(function(d) {return d.dx;})
    .fillStyle("rgba(255, 128, 128, .4)")
    .cursor("move")
    .event("mousedown",pv.Behavior.drag()/*(function(){ 
                          var callee=pv.Behavior.drag();
                          return function(e) {
                             callee(e);
                          }
                        })()*/)
    .event("drag", TEST);

xvis.render();
}

var pw = 14,
z = ~~((w - pw * 2) / 53),
ph = z >> 1,
h = z * 7;

var mindate="1720-01-01";
var maxdate="1729-12-31";
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
var vis = d3.select("#gallery_chart")
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
function sumDate(data,str){
    var year=str.substr(0,4);
    var day=str.substr(str.length-2);
    if (day[0]=="-") {
        day=day.substr(1);
    }
    var month = str.substr(5,2);
    if (month[1]=="-"){
        month=month.substr(0,1);
    }
    monthInt=""+parseInt(month[0]=="0"?month.substr(1):month);
    dayInt=""+parseInt(day[0]=="0"?day.substr(1):day);
    var full=str;//year+"-"+month+"-"+day;
    var part=year+"-"+monthInt+"-"+dayInt;
    var retval=0;
    if (full in data) {
        retval+=parseInt(data[full]);
    }
    if (part!=full&&part in data) {
        retval+=parseInt(data[part]);
    }
    return retval;
}
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
            processData(data);
        }
    };
    var requestObject={msg:"summary",start:mindate,finish:maxdate};
    
    xhr.open("GET","query?q={\"msg\":\"summary\"}");//+encodeURIComponent(JSON.stringify(requestObject)));
    return xhr.send();
}

requestDateChange(mindate,maxdate);
var processData= 
 (function() {
  var minPossibleDate="1001-01-01";
  var maxPossibleDate="2664-12-31";
  var smallestDate=maxPossibleDate;
  var biggestDate=minPossibleDate;
  return function (data) {
      var curSmallestDate=maxPossibleDate;
      var curBiggestDate=minPossibleDate;
      var i;
      for (i in data) {
        var dat=i;
        if (dat<curSmallestDate&&dat>minPossibleDate)
            curSmallestDate=dat;
        if (dat>curBiggestDate&&dat<maxPossibleDate)
            curBiggestDate=dat;
      }
      if (curSmallestDate!=smallestDate||curBiggestDate!=biggestDate) {
          smallestDate=curSmallestDate;
          biggestDate=curBiggestDate;
          var summaryHash = {
              
          };
          
          for (i in data) {
              var month=i.substr(0,7);
              if (month in summaryHash)
                  summaryHash[month]+=data[i];
              else
                  summaryHash[month]=data[i];
          }
          var summary=[];
          var biggestYear=biggestDate.substr(0,4);
          for (i=parseInt(smallestDate.substr(0,4));i<=biggestYear;++i){
              for (var mon=1;mon<=12;++mon) {
                  var strdate=""+i+"-"+(mon>10?1:0)+(mon%10);
                  var val=summaryHash[strdate];
                  if (!val)
                      val=0;
                  summary.push({x:new Date(strdate+"-01"),
                                y:val
                               });
              }
          }
          function convertDate(date){
              return parseFloat(date.substr(0,4)+(parseFloat(date.substr(5,2))-1)/12.0);
          }
          var smallestFloatDate=convertDate(smallestDate);
          var biggestFloatDate=convertDate(biggestDate);
          console.log("Smallest date: "+smallestDate+" = "+smallestFloatDate+" Biggest Date "+biggestDate+ " data "+JSON.stringify(summary));
      }
      vis.selectAll("rect.day")
          .attr("class", function(d) {var q=sumDate(data,d.Date);return "day q" + (q?(q>4?8:q+4):undefined) + "-9";})
          .append("svg:title")
          .text(function(d) { return d.Date + ": " + (sumDate(data,d.Date)); });
      
  };
})();
  