import urlparse,urllib
import json
import json.decoder
import json.encoder
import sys
#import config
                                        
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
def daterange():
    mindate=str(1100)+"-";
    maxdate=str(2664)+"-";
    
    db = connect();
    cursor = db.cursor()
    cursor.execute('INSERT IGNORE INTO summary SELECT DATE(date), COUNT(1) TotalCount from links WHERE link_type="sent_from" AND DATE(date) IS NOT NULL group by Date(date) having count(1)>=1');
    retval={}
    rows=cursor.fetchall();
    return str(rows)
methodMap={"daterange":daterange};
def application(environ, start_response):
    status = '200 OK'
    output = ''
    sys.path+=[environ["SCRIPT_FILENAME"][:environ["SCRIPT_FILENAME"].rfind("/")]]
    queryString = environ["QUERY_STRING"];
    argset = urlparse.parse_qs(queryString, keep_blank_values=True, strict_parsing=False)
    output=daterange()    
    response_headers = [('Content-type', 'text/plain'),
                        ('Content-Length', str(len(output)))]
    start_response(status, response_headers)

    return [output]
