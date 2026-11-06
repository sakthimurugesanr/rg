import photos from './photos.json';
export const stockPhotos = photos;
const slots:Record<string,string>={
 'polyester-roll-01':'fabric-rolls','polyester-roll-02':'blue-rolls','polyester-swatch':'blue-weave','swatch-fan':'fabric-selection','knitted-weave':'blue-weave',
 'yellow-turkey-silk':'white-drape','blue-printed-matty':'fabric-selection','warehouse-aisle':'fabric-rolls','loading-area':'blue-rolls','team':'fabric-selection',
 'green-salena':'fabric-selection','yellow-spun':'fabric-rolls','purple-pique':'blue-weave','blue-dot-melange':'blue-rolls','plain-knit':'blue-weave','blue-karan':'blue-drape','nirmal-knit':'white-drape','purple-knit':'blue-weave',
 'application-1':'blue-drape','application-2':'blue-weave','application-3':'blue-rolls','application-4':'white-drape','application-5':'fabric-selection'
};
export function photoForSlot(slot:string){const base=slot.replace(/-(detail|roll)$/,'');const key=slot.endsWith('-detail')?'blue-weave':slot.endsWith('-roll')?'fabric-rolls':slots[slot]||slots[base]||'fabric-rolls';return stockPhotos.find(p=>p.key===key)!}
