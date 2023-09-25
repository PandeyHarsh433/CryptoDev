// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.tokenId;
  const name = `Crypto Dev #${tokenId}`;
  const description = "CryptoDevs is an NFT collection for Web3 Developers";
  const image = `https://raw.githubusercontent.com/PandeyHarsh433/nft-images/main/${
    tokenId - 1
  }.svg`;
  return res.json({
    name: name,
    description: description,
    image: image,
  });
}
