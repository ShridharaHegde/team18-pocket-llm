from simhash import Simhash

class LFUCache:
    def __init__(self, size=100):
        self.size = size
        self.cache = {}  # {int_hash: [value, hit_count]}

    def add_cache(self, key, value):
        if len(self.cache) >= self.size:
            self.remove_lfu()
        self.cache[key] = [value, 0]  # [value, hit count]

    def check_cache(self, key):
        # find nearest value to the key in the cache based on hamming distance
        lowest_distance = float('inf')
        key_found = None

        for cached_key in self.cache.keys():
            # XOR integer hashes, count differing bits
            distance = bin(cached_key ^ key).count("1")
            if distance < lowest_distance:
                lowest_distance = distance
                key_found = cached_key

        if key_found is None:
            return None

        similarity = 1 - (lowest_distance / 64.0)

        if similarity >= 0.8:
            self.cache[key_found][1] += 1
            return self.cache[key_found][0]

        return None

    def remove_lfu(self):
        # removes least frequently used key
        lfu_key = min(self.cache, key=lambda k: self.cache[k][1])
        del self.cache[lfu_key]


class CacheManager:
    def __init__(self, size=100):
        self.lfu_cache = LFUCache(size)

    def get(self, key: str):
        key_hash = Simhash(key).value  # use 64-bit integer
        return self.lfu_cache.check_cache(key_hash)

    def set(self, key: str, value: str):
        key_hash = Simhash(key).value  # use 64-bit integer
        self.lfu_cache.add_cache(key_hash, value)
