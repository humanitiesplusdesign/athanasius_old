import urlparse,urllib
import json
import json.decoder
import json.encoder
import sys
#import config
jsonEncoder=json.encoder.JSONEncoder()                                        
def connect():                                                                  
    import config 
    import MySQLdb
    return MySQLdb.connect(                                                     
        host=config.host,                                                       
        user=config.user,                                                       
        passwd=config.pw,                                                       
        db=config.database)     

jsondecode=json.decoder.JSONDecoder()
def normalizeDate(date):

    for i in range(8,10):
        if date[i]=='-':
            return date[:i]
    return date[:10]
    dates=date.split("-")
    if len(dates[1])==1:
        dates[1]="0"+dates[1];
    if len(dates[2])==1:
        dates[2]="0"+dates[2];
    return dates[0]+"-"+dates[1]+"-"+dates[2];
def summary(msg):
    
    db = connect();
    cursor = db.cursor()#just a test to see how long it takes to fetch all summarized data
    if "start" in msg and "finish" in msg:
        cursor.execute('SELECT date, TotalCount from summary WHERE date>=Date("'       +msg["start"]+'") AND date <= Date("'+msg["finish"]+'")');        
    else:
        cursor.execute('SELECT date, TotalCount from summary');
    retval={}
    def processDate(d):
        
        return str(d)
    for row in cursor.fetchall():
        retval[processDate(row[0])]=row[1];
    return jsonEncoder.encode(retval);

def daterange(arg):
    mindate=str(int(arg["start"][0:4]))+"-";
    maxdate=str(int(arg["finish"][0:4])+1)+"-";
    
    db = connect();
    cursor = db.cursor()
    cursor.execute('SELECT date, COUNT(1) TotalCount from links WHERE date>="'+mindate+'" AND date < "'+maxdate +'" and link_type="sent_from" group by date having count(1)>=1');
    retval={}
    row=cursor.fetchone();
    while row:
        key=normalizeDate(row[0]);
        if not key in retval:
            retval[key]=row[1];
        else:
            retval[key]+=row[1];
        row=cursor.fetchone()
    return json.encoder.JSONEncoder().encode(retval);
methodMap={"daterange":daterange,"summary":summary};
def application(environ, start_response):
    status = '200 OK'
    output = ''
    sys.path+=[environ["SCRIPT_FILENAME"][:environ["SCRIPT_FILENAME"].rfind("/")]]
    queryString = environ["QUERY_STRING"];
    argset = urlparse.parse_qs(queryString, keep_blank_values=True, strict_parsing=False)
    decoded={}
    try:
        if 'q' in argset:
            decoded=jsondecode.decode(argset['q'][0]);
    except:
        pass
    res=""
    if "msg" in decoded and decoded["msg"] in methodMap:
        res=methodMap[decoded["msg"]](decoded)
    
    output+=res
    response_headers = [('Content-type', 'text/plain'),
                        ('Content-Length', str(len(output)))]
    start_response(status, response_headers)

    return [output]
