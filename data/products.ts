export const categories = [
 {slug:'polyester',name:'Polyester Fabric',count:4,image:'polyester-roll-01',description:'Plain, spun, pique and dot melange polyester fabrics. Ask for available colours, GSM and widths.'},
 {slug:'knitted',name:'Knitted Fabric',count:5,image:'knitted-weave',description:'Plain knit, Karan, Nirmal and purple polyester knitted fabrics. Ask us for more options.'},
 {slug:'silk',name:'Silk Fabric',count:1,image:'yellow-turkey-silk',description:'Enquire about Yellow Turkey Silk Fabric, its composition and available specifications.'},
 {slug:'matty',name:'Matty Fabric',count:1,image:'blue-printed-matty',description:'Enquire about Blue Printed Matty Fabric and ask for the current pattern and specifications.'}
];
const catalogue = [
 ['Green Salena Plain Polyester Fabric','polyester','Green','Plain polyester','green-salena-plain-polyester','green-salena','Green Salena plain polyester. Request an actual swatch and confirm the shade before ordering.','#6f8473'],
 ['Yellow Spun Polyester Fabric','polyester','Yellow','Spun polyester','yellow-spun-polyester','yellow-spun','Yellow spun polyester. Ask for composition, finish and roll size.','#c8942b'],
 ['Purple Polyester Pique Fabric','polyester','Purple','Polyester pique','purple-polyester-pique','purple-pique','Purple polyester pique. Ask for a close-up swatch and fabric specifications.','#80708b'],
 ['Blue Dot Melange Polyester Fabric','polyester','Blue','Dot melange polyester','blue-dot-melange-polyester','blue-dot-melange','Blue dot melange polyester. Confirm the texture, GSM and available quantity.','#55768c'],
 ['Plain Knit Polyester Fabric','knitted','Ask for details','Polyester knit','plain-knit-polyester','plain-knit','Plain knit polyester fabric. Ask for current colours, weight and width.','#aaa297'],
 ['Blue Karan Plain Polyester Knitted Fabric','knitted','Blue','Polyester knit','blue-karan-plain-polyester-knitted','blue-karan','Blue Karan plain polyester knit. Ask for an actual colour swatch and roll details.','#55768c'],
 ['Plain Polyester Nirmal Knit Fabric','knitted','Ask for details','Polyester knit','plain-polyester-nirmal-knit','nirmal-knit','Plain polyester Nirmal knit. Confirm the available colours and specifications with us.','#aaa297'],
 ['Purple Polyester Knitted Fabric','knitted','Purple','Polyester knit','purple-polyester-knitted','purple-knit','Purple polyester knit. Ask for GSM, width and current availability.','#80708b'],
 ['Yellow Turkey Silk Fabric','silk','Yellow','Turkey silk','yellow-turkey-silk','yellow-turkey-silk','Yellow Turkey silk fabric. Confirm composition, finish and available roll quantities.','#c8942b'],
 ['Blue Printed Matty Fabric','matty','Blue','Printed matty','blue-printed-matty','blue-printed-matty','Blue printed matty fabric. Ask for current prints, composition and roll size.','#55768c']
];
// Catalogue counts are owner-supplied: the fifth knitted name is not yet provided.
export const products = catalogue.map(([name,category,colour,fabricType,slug,image,description,chip])=>({name,category,colour,fabricType,slug,image,description,chip,specs:{GSM:'Ask for details',Width:'Ask for details',Composition:'Ask for details','Roll size':'Ask for details',MOQ:'Ask for details',Finish:'Ask for details'}}));
export type Product = typeof products[number];
