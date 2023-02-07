const { deterministicPartitionKey } = require("./dpk");

// SHA3-512 hash of '1'
const HASH_1_SHA3_512 = "ca2c70bc13298c5109ee0cb342d014906e6365249005fd4beee6f01aee44edb531231e98b50bf6810de6cf687882b09320fdd5f6375d1f2debd966fbf8d03efa";

// SHA3-512 hash of '"1"'
const HASH_QUOTED_1_SHA3_512 = "a36531fc8e1c0156ab10a29e6aa53acb00083b1ce239dbcfc9a67f77e6f866059d25bb3e2d83fe542d8a8fd02ff22a0ee963fb6d321e0c48df00b44ec819da97";

// SHA3-512 hash of '1' (repeated 257 times)
const HASH_1_257_SHA3_512 = "3f2e417dd3287bb9d5a0e47a8a25191210abdd7739d882cea800f3180dc91508c047c737c51abad48d4d4f2469776294e2b4d9de0af65bffb147d7655ff49fa8";

describe("deterministicPartitionKey", () => {
  it("Returns the literal '0' when given no input", () => {
    const trivialKey = deterministicPartitionKey();
    expect(trivialKey).toBe("0");
  });

  it("Returns SHA3-512(1) when given number 1", () => {
    const key = deterministicPartitionKey(1);
    expect(key).toBe(HASH_1_SHA3_512);
  });

  it("Returns SHA3-512('\"1\"') when given string '1'", () => {
    const key = deterministicPartitionKey("1");
    expect(key).toBe(HASH_QUOTED_1_SHA3_512);
  });

  it("Returns string '1' when partitionKey is number 1", () => {
    const event = {
      partitionKey: 1
    };
    const key = deterministicPartitionKey(event);
    expect(key).toBe("1");
  });

  it("Returns string '1' when partitionKey is string '1'", () => {
    const event = {
      partitionKey: "1"
    };
    const key = deterministicPartitionKey(event);
    expect(key).toBe("1");
  });

  it("Returns string '1' (repeat 256) when partitionKey is string '1' (repeat 256)", () => {
    const partition = "1".repeat(256);
    const event = {
      partitionKey: partition
    };
    const key = deterministicPartitionKey(event);
    expect(key).toBe(partition);
  });

  it("Returns SHA3-512('1' (repeat 257)) when partitionKey is string '1' (repeat 257)", () => {
    const event = {
      partitionKey: "1".repeat(257)
    };
    const key = deterministicPartitionKey(event);
    expect(key).toBe(HASH_1_257_SHA3_512);
  });
});