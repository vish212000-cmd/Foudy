import urllib.request
import time

for i in range(30):
    try:
        req = urllib.request.Request('https://foudy.onrender.com/health/', method='GET')
        res = urllib.request.urlopen(req, timeout=10)
        if res.status == 200:
            print('SUCCESS')
            break
    except Exception as e:
        print('Attempt', i, 'failed:', e)
    time.sleep(10)
