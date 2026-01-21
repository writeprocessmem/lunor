/*


 BADGE OPTIONS: "HOT", "NEW", "SALE", "BEST VALUE", or null for none
 CATEGORY OPTIONS: "scripts", "accounts", "services"
 TAGS: Any string array, e.g. ["Scripts", "Popular"]
 

 */

const CONFIG = {
    store: {
        name: "Lunor",
        currency: "$",
        discordLink: "https://discord.gg/lnr"
    },

    sale: {
        enabled: true,
        message: "LAUNCH SPECIAL!",
        code: "LUNOR20",
        percent: 20
    },

    products: [
        {
            id: "lunor-basic",
            name: "Lunor Basic",
            description: "",
            longDescription: "",
            price: 4.99,
            originalPrice: null,
            category: "scripts",
            badge: null,
            image: "assets/product.png",
            tags: ["Scripts"],
            features: ["Basic features", "Regular updates", "Discord support"]
        },
        {
            id: "lunor-premium",
            name: "Lunor Premium",
            description: "",
            longDescription: "",
            price: 14.99,
            originalPrice: null,
            category: "scripts",
            badge: "HOT",
            image: "assets/product.png",
            tags: ["Scripts"],
            features: ["All features", "Priority updates", "Premium Discord support"]
        }
    ]
};
