import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"

const WORDS = [
  "ant", "ape", "bat", "bear", "bee", "bird", "boar", "buck", "bull", "cat",
  "clam", "cod", "colt", "crab", "crow", "deer", "dog", "dove", "duck", "eel",
  "elk", "emu", "fawn", "finch", "fish", "flea", "fly", "frog", "gnat", "goat",
  "hawk", "hen", "hog", "horse", "ibis", "jay", "kite", "lamb", "lark", "lion",
  "lynx", "mink", "mole", "moth", "mule", "newt", "owl", "ox", "pike", "pony",
  "pug", "quail", "ram", "rat", "raven", "robin", "rook", "seal", "slug", "snail",
  "swan", "toad", "trout", "vole", "wasp", "weasel", "wolf", "wren", "yak", "zebra",
  "alpaca", "bison", "camel", "cheetah", "chimp", "cobra", "condor", "cougar", "crane", "dingo",
  "donkey", "falcon", "ferret", "flamingo", "fox", "gecko", "gibbon", "giraffe", "gorilla", "grouse",
  "hamster", "hare", "heron", "hippo", "hyena", "iguana", "impala", "jackal", "jaguar", "jellyfish",
  "koala", "komodo", "lemur", "leopard", "llama", "lobster", "macaw", "mamba", "manatee", "meerkat",
  "mongoose", "moose", "narwhal", "ocelot", "octopus", "okapi", "orca", "osprey", "otter", "panda",
  "panther", "parrot", "peacock", "pelican", "penguin", "porcupine", "puma", "python", "rabbit", "raccoon",
  "rhino", "salmon", "scorpion", "shark", "sloth", "squid", "stork", "tapir", "tiger", "toucan",
  "turtle", "vulture", "walrus", "warthog", "wildcat", "wolverine", "wombat", "woodpecker", "xerus", "zorilla",
  "axolotl", "badger", "barracuda", "beetle", "blobfish", "capybara", "caribou", "cassowary", "catfish", "chameleon",
  "chinchilla", "coyote", "cuttlefish", "dodo", "dragonfly", "dugong", "echidna", "firefly", "flounder", "gazelle",
  "gharial", "gopher", "grasshopper", "hedgehog", "hornet", "katydid", "kingfisher", "kinkajou", "kookaburra", "kudu",
  "bag", "ball", "bell", "bolt", "book", "boot", "bowl", "box", "brush", "cage",
  "cake", "cap", "card", "cart", "chair", "clip", "clock", "coat", "coin", "comb",
  "cup", "desk", "dish", "door", "drum", "fan", "flag", "flask", "fork", "frame",
  "gate", "gem", "glove", "jar", "jug", "key", "knife", "lamp", "lens", "log",
  "map", "mask", "mat", "mug", "nail", "net", "pad", "pan", "pen", "pin",
  "pipe", "plate", "plug", "pot", "pump", "ring", "rod", "rope", "rug", "sail",
  "shelf", "shoe", "soap", "sock", "spoon", "strap", "sword", "tank", "tape", "tent",
  "tile", "tin", "tool", "tray", "tube", "vase", "wall", "web", "wick", "wire",
  "anchor", "anvil", "axe", "badge", "barrel", "basket", "beacon", "blade", "brick", "bucket",
  "candle", "canvas", "chain", "chest", "chisel", "compass", "crate", "crown", "dagger", "dial",
  "ember", "flask", "funnel", "hammer", "hatch", "hook", "lantern", "latch", "lever", "lock",
]

function randomWord(): string {
  const bytes = randomBytes(2)
  const index = ((bytes[0] << 8) | bytes[1]) % WORDS.length
  return WORDS[index]
}

function randomNumber(): number {
  const bytes = randomBytes(2)
  return ((bytes[0] << 8) | bytes[1]) % 9000 + 1000
}

export async function generateUniqueUserCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `${randomWord()}${randomNumber()}`.slice(0, 15)
    const exists = await prisma.user.findFirst({ where: { code } })
    if (!exists) return code
  }
  throw new Error("Failed to generate a unique code after 5 attempts")
}
