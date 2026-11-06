export const business = {name:'R.G. Traders',phone:'+91 98439 99828',tel:'tel:+919843999828',gst:'33BUCPT2817H1ZO',banker:'Tamilnad Mercantile Bank',address:'48HP+P26, Maruthachalapuram, 60 Feet Road, Sivan Theatre Rd, Tiruppur, Tamil Nadu 641602'};
export const whatsapp = (message:string) => `https://wa.me/919843999828?text=${encodeURIComponent(message)}`;
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('R.G. Traders '+business.address)}`;
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rg-traders-fabric-studio.springynarwhal1.chatgpt.site';
