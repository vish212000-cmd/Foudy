import asyncio
import time
import sys

# Simulated Load Testing Script for FOUDY WebSocket & Redis
# A real load test would use something like locust or artillery.
# This script simulates the concurrent overhead of managing connections.

async def simulate_user(user_id):
    # Simulate connection latency
    await asyncio.sleep(0.1)
    
    # Simulate heartbeat interval
    for _ in range(5):
        await asyncio.sleep(1)
        
    # Simulate disconnect
    return user_id

async def run_load_test(concurrent_users=500):
    print(f"Starting simulated load test with {concurrent_users} users...")
    start_time = time.time()
    
    tasks = [simulate_user(i) for i in range(concurrent_users)]
    results = await asyncio.gather(*tasks)
    
    duration = time.time() - start_time
    print(f"Completed {len(results)} simulated connections in {duration:.2f} seconds.")
    print(f"Simulated Throughput: {concurrent_users / duration:.2f} connections/second")

if __name__ == "__main__":
    users = 500
    if len(sys.argv) > 1:
        users = int(sys.argv[1])
    asyncio.run(run_load_test(users))
