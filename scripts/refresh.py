"""Extract public geological intervals, retaining only community and log identifiers."""
import argparse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
import csv
from datetime import datetime, timezone
import io
import json
import math
from pathlib import Path
import shutil
import subprocess
from tempfile import TemporaryDirectory
import time
from urllib.request import Request, urlopen
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
BC = 'https://apps.nrs.gov.bc.ca/gwells/api/v2/wells/'
NS = 'https://novascotia.ca/nse/groundwater/docs/NS_Well_Logs_2020.zip'
TAGS = [48,50,51,52,30145,30146,30152,30153,41874,41892,41893,41897,58621,58629,58639,58644,123889,123890]
COMMUNITIES = ['FALL RIVER','PORTERS LAKE','HAMMONDS PLAINS','UPPER TANTALLON','MUSQUODOBOIT HARBOUR','SAMBRO']


def fetch(url):
    for attempt in range(3):
        try:
            return urlopen(Request(url,headers={'User-Agent':'CoolCode WellLayers/1.0'}),timeout=90).read()
        except OSError:
            if attempt==2:
                raise
            time.sleep(2**attempt)


def interval(start,end,text):
    try:
        a,b=float(start),float(end)
    except (ValueError,TypeError):
        return None
    if not (math.isfinite(a) and math.isfinite(b) and 0<=a<b):
        return None
    return [a,b,(text or '').strip() or 'Material unrecorded']


def bc_log(tag, cache):
    raw=(cache/f'bc-{tag}.json').read_bytes() if cache else fetch(BC+str(tag))
    record=json.loads(raw)
    layers=[]
    for item in record['lithologydescription_set']:
        layer=interval(item['start'],item['end'],item['lithology_raw_data'])
        if layer: layers.append(layer)
    if not layers or int(record['well_tag_number'])!=tag:
        raise ValueError(f'Expected well log {tag}')
    return dict(id=str(tag),province='BC',place=record['city'].strip().title(),layers=sorted(layers))


def table(db, name):
    result=subprocess.run(['mdb-export',str(db),name],check=True,stdout=subprocess.PIPE)
    return csv.DictReader(io.StringIO(result.stdout.decode('utf-8',errors='replace')))


def ns_logs(zipped, directory):
    with ZipFile(zipped) as archive:
        name=next(n for n in archive.namelist() if n.lower().endswith(('.mdb','.mde')))
        db=Path(directory)/'source.mdb'
        with archive.open(name) as inp,db.open('wb') as out: shutil.copyfileobj(inp,out)
    location={r['WellNumber']:r['NearestCommunity'].strip().upper() for r in table(db,'tblWellLogs') if r['CountyL']=='8' and r['NearestCommunity'].strip().upper() in COMMUNITIES}
    maps=[]
    for tab,key,value in [('tblLithoColour','LookupCode','Colour'),('tblLithoDescription','LookupCode','Description'),('tblLithology','Lookup','Lithology')]:
        maps.append({r[key]:r[value].lower() for r in table(db,tab)})
    strata=defaultdict(list)
    for r in table(db,'tblStratigraphy'):
        if r['WellNumber'] not in location: continue
        parts=[]
        for n in (1,2):
            words=[mapping.get(r[f'{label} {n}'],'') for mapping,label in zip(maps,['Colour','Description','Lithology'])]
            if any(words): parts.append(' '.join(w for w in words if w))
        layer=interval(r['From'],r['To'],' / '.join(parts))
        if layer: strata[r['WellNumber']].append(layer)
    result=[]
    for place in COMMUNITIES:
        ids=sorted(k for k in strata if location[k]==place and len(strata[k])>=2)
        if len(ids)<8: raise ValueError(f'Missing logs for {place}')
        for i in range(8):
            key=ids[(len(ids)-1)*i//7]
            result.append(dict(id=key,province='NS',place=place.title(),layers=sorted(strata[key])))
    return result


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--source-cache',type=Path,help='Directory containing the provincial source downloads')
    args=p.parse_args()
    with TemporaryDirectory() as temp:
        zipped=args.source_cache/'ns.zip' if args.source_cache else Path(temp)/'ns.zip'
        if not args.source_cache: zipped.write_bytes(fetch(NS))
        logs=ns_logs(zipped,temp)
        with ThreadPoolExecutor(max_workers=3) as pool:
            logs.extend(pool.map(lambda t:bc_log(t,args.source_cache),TAGS))
    logs.sort(key=lambda r:(r['province'],r['place'],r['id']))
    status=dict(retrieved=datetime.now(timezone.utc).date().isoformat(),count=len(logs),intervals=sum(len(r['layers']) for r in logs))
    dest=ROOT/'web/data'
    for name,obj in [('logs',logs),('status',status)]:
        (dest/f'{name}.json').write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n')
    print(status)

if __name__=='__main__': main()
