import prisma from "../utils/prisma"

async function main(){

  await prisma.book.deleteMany()

  await prisma.book.createMany({
    data:[
      {title: "Test", author:"Test Author",pages:123,price:1500},
      {title: "Etranger", author:"Camus",pages:80,price:900},
    ],
  })

  console.log("Seed termine")
}

main()
.catch((e) => { console.error(e); process.exit(1)})
.finally(() => prisma.$disconnect())