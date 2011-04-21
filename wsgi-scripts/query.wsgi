import urlparse,urllib
import json
import json.decoder
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

def daterange(arg):
    mindate=str(int(arg["start"][0:4]))+"-";
    maxdate=str(int(arg["finish"][0:4]))+"-";
    
    db = connect();
    cursor = db.cursor()
    cursor.execute('SELECT date, COUNT(1) TotalCount from links WHERE date>"'+mindate+'" AND date < "'+maxdate +'" and link_type="sent_from" group by date having count(1)>=1');
    retval=""
    row=cursor.fetchone();
    while row:
        retval+=str(row);
        row=cursor.fetchone()
    return retval
methodMap={"daterange":daterange};
def application(environ, start_response):
    status = '200 OK'
    output = 'Hello Query: '
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
