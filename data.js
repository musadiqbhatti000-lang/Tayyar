/* Tayyar prototype data. Menus marked sample:true are placeholders; the rest were transcribed from menu photos taken on campus. */
const AREAS = [
  {id:'gatorade', name:'Gatorade Café',  where:'Open-air food court near Adamjee', pickup:'Gatorade Café pickup counter', x:226, y:290, la:'b'},
  {id:'pepsi',    name:'Pepsi Café',     where:'Beside Gatorade Café',             pickup:'Pepsi Café pickup counter',    x:256, y:274, la:'r'},
  {id:'adamjee',  name:'Adamjee Kiosks', where:'Outside Adamjee Academic Center',  pickup:'Kiosk window',                 x:226, y:228, la:'r'},
  {id:'sc',       name:'SC Café',        where:'Alumni Student Center',            pickup:'SC Café pickup counter',       x:110, y:181, la:'b'},
  {id:'library',  name:'Library Café',   where:'Inside Mian Abdullah Library',     pickup:'Woke counter',            x:334, y:229, la:'b'}
];
/* item: [name, price]  or  [name, [[option, price], ...]]  ; optional 3rd = flavour list, 4th = short description */
const RL = (r,l) => [['Regular',r],['Large',l]];
const SODA11 = ['Blueberry','Peach','Strawberry','Pineapple','Lychee','Anar','Golden Apple','Guava / Amrood','Falsa','Pakola','Red Grapes'];
const OUTLETS = [
  {id:'kebab-hut', area:'gatorade', name:'Kebab Hut', p:'KH', hue:8, kind:'roll', cat:'Rolls & burgers', tag:'BBQ rolls, fast food, Chinese', pop:3.5, rate:8,
    menu:[
      {t:'BBQ rolls', k:'roll', items:[['Malai Boti Chatni Roll',[['Regular',200],['Jumbo',300]]],['Bihari Chatni Roll',[['Regular',200],['Jumbo',300]]],['Bihari Mayo Roll',[['Regular',200],['Jumbo',300]]],['Chicken Boti Box (100g)',250],['Pori Paratha',50]]},
      {t:'Fast food', k:'burger', items:[['Crispy Zinger Burger',300],['Kebab Hut Special Burger',450],['Chicken Grill Burger',350],['Classic Husler',200],['BBQ Husler',250],['Husler Jumbo',300],['Husler Tortilla',250],['Husler Tortilla Jumbo',300],['Buffalo Beef Burger',400],['Buffalo Double Cheese',500],['Loaded Fries',350],['Masala Fries',150],['Mayo Garlic Fries',200],['Chicken Popcorn',300],['Chicken Strips',300]]},
      {t:'Chinese', k:'rice', items:[['Grill Chicken with Fried Rice',350],['Chicken Chowmein',300],['Chicken Chowmein with Sausages',350]]}
    ]},
  {id:'nawab', area:'gatorade', name:'Nawab Dynasty', p:'ND', hue:32, kind:'chai', cat:'Desi', tag:'Tea, shawarma, pulao, steak, Chinese', pop:2.6, rate:8,
    menu:[
      {t:'Tea', k:'chai', items:[['Kahwa',100],['Dhood Patti',100],['Coffee',170],['Hot Chocolate',200]]},
      {t:'Shawarma', k:'roll', items:[['Chicken Shawarma',180],['Chicken Cheese Shawarma',220],['Special Chicken Shawarma',250]]},
      {t:'Rice', k:'rice', items:[['Mexican Rice',200],['Garlic Chicken Rice',350],['Lemon Chicken Rice',350]]},
      {t:'Pakistani', k:'rice', items:[['Plain Pulao',200],['Qeema Pulao',350],['Handi Pulao',320]]},
      {t:'Chicken steak', k:'chicken', items:[['Tarragon Steak',400,null,'120 g chicken with rice on the side'],['Mustard Steak',380,null,'120 g chicken with rice on the side'],['Moroccan Steak',380,null,'120 g chicken with rice on the side'],['Double Decker Steak',400,null,'120 g chicken with rice on the side']]},
      {t:'Chinese', k:'noodles', items:[['Chicken Chowmein',300],['Veg Chowmein',250],['Chicken Pasta (White)',350],['Chicken Pasta (Red)',300],['Shashlik',320],['Manchurian',320],['Cajun Chicken Pasta',300],['Dry Chilli',370],['Cheesy Fusilli Pasta',350]]}
    ]},
  {id:'gyroverse', area:'gatorade', name:'Gyroverse', p:'GV', hue:200, kind:'roll', cat:'Rolls & burgers', tag:'Gyro wraps in pita or tortilla', pop:2.2, rate:6,
    menu:[
      {t:'Desi (pita bread)', k:'roll', items:[['The Classic',250,null,'Chicken, hummus, lettuce, pickles, cucumber sauce, jalapeños'],['The Loaded',350,null,'Cheese, chicken, fries, hummus, jalapeños, lettuce, pickles'],['The Sulemani',240,null,'Chicken, hummus, jalapeños, pickles, cucumber sauce']]},
      {t:'Arabic (tortilla)', k:'roll', items:[['The OG',350,null,'Chicken, fries, hummus, jalapeños, lettuce, pickles'],['Special Arabic',400,null,'Cheese, chicken, fries, hummus, jalapeños, lettuce, pickles'],['All Veggies',300,null,'Hummus, lettuce, pickles, jalapeños, fries, cucumber']]},
      {t:'Beverages', k:'soda', items:[['Pepsi',90],['7UP',90],['Mirinda',90],['Gatorade',120],['Water',70]]}
    ]},
  {id:'flip-grill', area:'gatorade', name:'Flip & Grill', p:'FG', hue:205, kind:'burger', cat:'Rolls & burgers', tag:'Smash burgers and curly fries', pop:1.8, rate:6,
    menu:[
      {t:'Burgers', k:'burger', items:[['O Smash Single',500],['O Smash Double',700]]},
      {t:'Make it a meal', k:'burger', items:[['O Smash + Fries',650],['O Double + Fries',850]]},
      {t:'Curly fries', k:'fries', items:[['Salted Fries',450],['Masala Fries',500]]},
      {t:'Extras', k:'dip', items:[['Extra Patty',200],['Extra Cheese',50],['Sauce',50]]}
    ]},
  {id:'sarim', area:'gatorade', name:'Kasim Samosa & Burger', p:'SS', hue:95, kind:'samosa', cat:'Snacks', tag:'Samosas and anday wala burgers', pop:2.4, rate:10, sample:true,
    menu:[{t:'Menu', k:'samosa', items:[['Aloo Samosa (2 pcs)',80],['Chicken Samosa (2 pcs)',120],['Samosa Chaat',180],['Anday Wala Burger',150],['Double Anday Wala Burger',220],['Fries',150]]}]},
  {id:'churro', area:'gatorade', name:'The Churro Station', p:'CS', hue:22, kind:'churro', cat:'Desserts', tag:'Churros and churro donuts', pop:1.4, rate:6,
    menu:[
      {t:'Churros', k:'churro', items:[['3 pcs Churros',450,null,'With chocolate dip. Serves 2'],['2 pcs Churros',350,null,'With chocolate dip. Serves 1']]},
      {t:'Churro donuts', k:'donut', items:[['Churro Donut',350,['Chocolate','Oreo','Sprinkle','Coconut']]]}
    ]},
  {id:'sizzle', area:'gatorade', name:'Sizzle Up', p:'SU', hue:170, kind:'soda', cat:'Drinks', tag:'Cold drinks and coolers', pop:1.6, rate:10, sample:true,
    menu:[{t:'Menu', k:'soda', items:[['Mint Margarita',220],['Peach Iced Tea',250],['Blue Lagoon',280],['Lemonade',180],['Strawberry Slush',260],['Mineral Water',80]]}]},
  {id:'sodavoda', area:'gatorade', name:'Soda Voda', p:'SV', hue:325, kind:'soda', cat:'Drinks', tag:'Sodas, slush, shakes, juice, ice cream', pop:1.9, rate:10,
    menu:[
      {t:'Soda', k:'soda', items:[['Regular Soda',RL(130,170),SODA11],['Lemonade Soda',RL(170,200),['Lemon Lime','Lemon Mint','Lemon Ginger']],['Signature Soda',RL(200,230),['Kulki','Black Current','Blackberry','Red Bull']],['Fusion Soda',RL(170,200),['Cocktail','Mocktail','Pine Berry','Blue Pine','Crazy Berry','Berry Blast']],['Milk Soda',RL(200,230),['Strawberry','Chocolate','Pakola','Caramel']]]},
      {t:'Slush', k:'soda', items:[['Regular Slush',RL(200,230),['Blueberry','Peach','Strawberry','Pineapple','Lychee','Anar','Golden Apple','Guava / Amrood','Falsa','Pakola','Pina Colada','Red Grapes']],['Lemonade Slush',RL(230,250),['Lemon Lime','Lemon Mint','Lemon Ginger']],['Signature Slush',RL(250,280),['Kulki','Black Current','Blackberry','Red Bull']]]},
      {t:'Ice cream shakes', k:'shake', items:[['Chocolate Shake',RL(400,500)],['KitKat Shake',RL(450,550)],['Oreo Shake',RL(350,450)],['Date Shake',RL(300,400)],['Banana Shake',RL(250,350)],['Banana + Date Shake',RL(300,400)],['Chicko Shake',RL(300,400)],['Chocolawa Shake',RL(400,500)],['Strawberry Shake',RL(400,500)],['Monster Hunter Shake',RL(800,999)],['Yogurt Shake',RL(200,300)]]},
      {t:'Fresh juice', k:'soda', items:[['Apple + Beetroot',RL(350,450)],['Beetroot + Carrot',RL(300,400)],['Carrot + Apple',RL(350,450)],['ABC',RL(350,450)],['Orange',RL(350,450)],['Sweet Lime / Mausambi',RL(300,400)],['Pineapple',RL(350,450)],['Watermelon',RL(250,350)],['Grapes Juice',RL(400,500)],['Guava / Amrood',RL(300,400)],['Detox Bottle',RL(400,500)],['Pineapple + Orange',RL(450,550)],['Carrot + Orange',RL(400,500)],['Orange + Lemon',RL(400,500)],['Watermelon + Lemon',RL(300,350)],['Mango + Orange',RL(450,550)]]},
      {t:'Ice cream and more', k:'icecream', items:[['Ice Cream',[['Single scoop',150],['Double scoop',250],['Cone, single scoop',180]],['Strawberry','Strawberry Cheesecake','Mango','Vanilla','Chocolate']],['Ice Lolly',30,['Strawberry','Blueberry','Pakola','Lychee','Mango','Orange','Falsa']],['Gola Ganda',[['Regular',100],['Medium',150],['Special',250]]],['Pakola Mineral Water 500 ml',70]]}
    ]},
  {id:'pepsi-cafe', area:'pepsi', name:'Pepsi Café', p:'PC', hue:215, kind:'rice', cat:'Meals', tag:"Today's menu: desi meals, Chinese, fast food", pop:3.2, rate:10,
    menu:[{t:"Today's menu", k:'curry', items:[['Chicken Pulao',350],['Chicken Karahi Boneless',350],['Chicken Ginger',350],['Daal Mung Masoor',150],['Daal with Plain Rice',220],['Mixed Vegetable',150],['Chicken Handi',350],['Chicken Handi with Fried Rice',400],['Chicken Shashlik with Fried Rice',400],['Dry Chilli with Fried Rice',400],['Chicken Pasta',380,['White','Red']],['Chicken Chowmein',380],['Zinger Burger',400],['Club Sandwich',320],['Hot Sandwich',250],['Mayo Fries',170],['Masala Fries',150],['Chapati',25]]}]},
  {id:'munch-lab', area:'adamjee', name:'Munch Lab', p:'ML', hue:28, kind:'cookie', cat:'Coffee', tag:'Cookies and coffee', pop:1.8, rate:6, sample:true,
    menu:[{t:'Menu', k:'coffee', items:[['Chocolate Chip Cookie',180],['Double Chocolate Cookie',200],['Red Velvet Cookie',220],['Americano',250],['Cappuccino',320],['Latte',340],['Iced Latte',380]]}]},
  {id:'chuggs', area:'adamjee', name:'Chuggs', p:'CH', hue:335, kind:'shake', cat:'Drinks', tag:'Shakes', pop:1.7, rate:6, sample:true,
    menu:[{t:'Menu', k:'shake', items:[['Chocolate Shake',350],['Strawberry Shake',350],['Mango Shake',370],['Oreo Shake',390],['Lotus Shake',450],['Cold Coffee',320]]}]},
  {id:'afridi', area:'sc', name:'Afridi Inn To Go', p:'AI', hue:38, kind:'burger', cat:'Meals', tag:'Burgers, shawarma, paratha, sandwiches, chai', pop:2.8, rate:8,
    menu:[
      {t:'Deals', k:'burger', items:[['The Student Deal',250,null,'1 aloo paratha, 1 regular tea'],['The Paratha Break',200,null,'1 lachha paratha, 1 dhood pati'],['Chai Special',130,null,'Dhood patti chai'],['The Lunch Wrap',420,null,'1 chicken wrap, 1 soft drink (345 ml)'],['The Zinger Combo',699,null,'1 zinger burger, 1 masala fries, 1 soft drink (345 ml)'],['The Shawarma Deal',750,null,'1 shawarma wrap, 4 pc chicken pops, 1 soft drink (345 ml)'],['The Seafood Solo',850,null,'1 fish zinger burger, 1 soft drink (345 ml)'],['The Snack Box',650,null,'4 pc chicken tenders, 1 hot coffee'],['Sweet & Savory',750,null,'1 Nutella paratha, 1 cappuccino'],['The Burger Pair',1250,null,'2 chicken burgers, 1 garlic mayo fries, 2 soft drinks'],['The Shawarma Duo',1200,null,'2 shawarma rolls, 6 pc chicken wings, 2 soft drinks'],['Club & Cheese',1150,null,'1 full chicken club sandwich, 1 cheese fries, 2 teas'],['The Afridi Mega Feast',1999,null,'2 beef burgers, 2 shawarma wraps, masala fries, 2 soft drinks'],['Seafood & Snacks Platter',2400,null,'4 pc fish n chips, 1 dynamite prawns, 1 garlic mayo fries, 2 soft drinks']]},
      {t:'Fast food', k:'burger', items:[['Zinger Burger',450],['Cheese Burger',550],['Beef Burger',500],['Beef Cheese Burger',580],['Chicken Burger',450]]},
      {t:'Shawarma', k:'roll', items:[['Shawarma Wrap',350],['Shawarma Roll',300],['Shawarma Platter',700],['Chicken Wrap',350],['Extra Bread',[['Pita',80],['Tortilla',90]]]]},
      {t:'Paratha', k:'paratha', items:[['Lacha Paratha',100],['Nutella Paratha',450],['Chicken Paratha',350],['Aloo Paratha',180],['Wheat Paratha',150]]},
      {t:'Sandwiches', k:'sandwich', items:[['Brown Club',[['Half',500],['Full',800]]],['BBQ Sandwich',[['Half',500],['Full',900]]],['Chicken Club',[['Half',500],['Full',800]]]]},
      {t:'Seafood', k:'chicken', items:[['Fish Zinger Burger',800],['Fish n Chips (4 pc)',800],['Dynamite Prawns',1400]]},
      {t:'Snacks and sides', k:'fries', items:[['Fries',200,['Plain','Masala']],['Garlic Mayo Fries',250],['Cheese Fries',280],['Chicken Wings (6 pc)',500],['Chicken Tenders (4 pc)',400],['Chicken Pops (8 pc)',400]]},
      {t:'Beverages', k:'coffee', items:[['Soft Drink (Regular)',100],['Dhood Pati',130],['Cardamom Tea',100],['Black Coffee',200],['Americano',250],['Latte',300],['Cappuccino',300],['Iced Coffee',400,['Americano','Latte']]]}
    ]},
  {id:'bamboo', area:'sc', name:'Bam-Bou', p:'BB', hue:350, kind:'noodles', cat:'Chinese', tag:'Rice bowls, noodles, dumplings, soups', pop:2.2, rate:6,
    menu:[
      {t:'Rice bowls', k:'rice', items:[['Szechuan Chicken',390],['Kung Pao Chicken',390],['Chicken Chilli Vegetables',390],['Chicken Chilli Dry',390],['Bangkok Chicken',390],['Hong Kong Chicken',390],['Beef Chilli Dry',490],['Crispy Beijing Beef',490],['Hunan Beef',490]]},
      {t:'Noodle bowls', k:'noodles', items:[['Chicken Chowmein',340],['Burmese Khaosuey',540],['Ramen Noodles',540]]},
      {t:'Soups', k:'curry', items:[['Chicken Corn Soup',250],['Hot and Sour Soup',250]]},
      {t:'Appetizers', k:'samosa', items:[['Chicken Spring Rolls (4 pcs)',160],['Fried Wontons (4 pcs)',240],['Dynamite Chicken (8 pcs)',290]]},
      {t:'Dumplings', k:'samosa', items:[['Steamed Dumplings (4 pcs)',390],['Steamed Dumplings in Szechuan Sauce (4 pcs)',420]]}
    ]},
  {id:'yellow-taxi', area:'sc', name:'Yellow Taxi Pizza Co.', p:'YT', hue:45, kind:'pizza', cat:'Pizza', tag:'Pizza, pasta, burgers, fries', pop:2.0, rate:6,
    menu:[
      {t:'Pizza', k:'pizza', items:[['Pizza',[['Jumbo slice',300],['Small',400],['Regular',900],['Large',1400]],['Ranch','Cheese','Pepperoni','Creamy Tikka','Chicken Tikka','Chicken Fajita','Taxi Max','Peri Peri Chicken','Chicken Supreme','Super Supreme','Veggie Lover','Creamy Alfredo','Pakistani Chaska']]]},
      {t:'Pasta', k:'noodles', items:[['Small Alfredo Pasta',450],['Regular Alfredo Pasta',650],['Regular Spicy Chicken Pasta',700],['Regular Lasagna',700]]},
      {t:'Burgers', k:'burger', items:[['Crispy Chicken Burger',[['Plain',400],['With cheese',450]]],['Crispy Chicken Ranch Burger with Jalapeños',[['Plain',450],['With cheese',500]]]]},
      {t:'Appetizers', k:'fries', items:[['Plain Fries',200],['Masala Fries',200],['Garlic Mayo Fries',300],['Cheese Fries',300],['Regular Pizza Fries',500],['Regular Chicken Tender Fries',500],['Cheese Bread-Sticks (4 pieces)',260],['Chilli Poppers (4 pieces)',390],['Chicken Strips (4 pieces)',440],['Dip',90,['Ranch','Dynamite','Garlic Mayo','Peri Peri Mayo']]]},
      {t:'Dessert', k:'cake', items:[['Chocolate Lava Cake',260],['Chocolate Lava Cake with Ice Cream',330]]},
      {t:'Drinks', k:'soda', items:[['Small Water',70],['345 ml Soft Drink Bottle',100],['Gatorade',140],['Large Water',140],['1 Ltr Soft Drink Bottle',200]]}
    ]},
  {id:'united-king', area:'sc', name:'United King', p:'UK', hue:52, kind:'pastry', cat:'Snacks', tag:'Bakery snacks, sandwiches, cakes', pop:1.9, rate:10,
    menu:[
      {t:'Fast food', k:'pastry', items:[['Pie (Cheese, Chicken)',150],['Korean Cream Cheese Bun',100],['Bread Pizza',200],['Pizza Slice',305],['Bread Roll',85],['Mini Calzone',160],['Turkish Pide',95],['Chicken Croissant',70],['Roll Chicken Spring',140],['Roll Chicken Cheese',120],['Samosa Chicken',75],['Samosa Qeema',60],['Samosa Aloo',60],['Roll Malai Boti',75],['Roll Chicken',80],['Roll Vegetable',70],['Chicken Lollipop',100],['Chillos',130],['Pizza Bomb',85],['Chicken Stick',135],['Chicken Patties',110],['Chicken Patties One Bite',55],['Beef Patties',110],['Vegetable Patties',95],['Mushroom Olive Patties',75],['Alfredo Pie',125]]},
      {t:'Salads', k:'salad', items:[['BBQ Salad',670],['Mix Salad',1680],['Tikka Salad',670],['Chicken Shahi Salad',670],['Fajita Salad',670],['Veggie Delight Salad',470]]},
      {t:'Subs and sandwiches', k:'sandwich', items:[['Fajita Sub Sandwich',825],['BBQ Sub Sandwich',825],['Chicken Shahi Sub Sandwich',825],['Tikka Sub Sandwich',825],['Veggie Delight Sub Sandwich',500],['BBQ Flat Bread Sandwich',720],['Shahi Flat Bread Sandwich',720],['Tikka Flat Bread Sandwich',720],['Fajita Flat Bread Sandwich',720],['BBQ Croissant Sandwich',750],['Fajita Croissant Sandwich',750],['Chicken Shahi Croissant Sandwich',750],['Eggwich Croissant Sandwich',625],['Tikka Croissant Sandwich',750],['Special Chicken Sandwich',260],['Plain Chicken Sandwich',210],['Plain Tikka Sandwich',230],['Plain Club Sandwich',220],['Shahi Tikka Sandwich',260]]},
      {t:'Cakes and desserts', k:'cake', items:[['Nutella Pastry',320],['Fudge Pastry',320],['Cake in a Cup Galaxy',520],['Cake in a Cup Lotus',550],['Cake in a Cup Nutella',520],['Cake in a Cup Red Velvet',480],['Ferrero Donut Mini',220],['Lotus Cheese Donut Mini',220],['Nutella Donut Mini',220],['Donut Mini (other flavours)',200],['Nutella Brownie',250],['Walnut Brownie',250],['Plain Brownie',195],['Plain Cake Small',460],['Chocolate Marble Cake Small',470],['Fudge Cake Small',1180],['Nutella Cake Small',1470],['Belgian Cake Small',1320],['Milky Malt Small',1080],['Milky Malt Medium',2200],['Three Milk Cake',2550]]},
      {t:'Packed products', k:'cookie', items:[['Croissant Butter',230],['Croissant Strawberry',260],['Croissant Chocolate',310],['Croissant Lotus',420],['Croissant Pistachio Kunafa',420],['Crinkle Salty',140],['Plain Salty',140],['Crinkle Spicy',140],['Plain Spicy',140],['Black Pepper Slims',100],['Potato Slims',100],['Slims Paprika',100],['Mayo Garlic Slim',100],['Crispino French Heart',365],['Mix Butter Biscuit',550],['Chocolate Delight Butter Biscuit',550],['Cake Rusk 300 gm',600],['Assorted Cookies',975]]}
    ]},
  {id:'schokola', area:'sc', name:'Schokola', p:'SK', hue:190, kind:'brownie', cat:'Desserts', tag:'Coffee, cookies, brownies, cakes, waffles', pop:1.6, rate:8,
    menu:[
      {t:'Hot beverages', k:'coffee', items:[['Cloud Cappuccino',450],['Campus Fuel (Americano)',400]]},
      {t:'Iced latte', k:'coffee', items:[['Chilled Brew Latte',550],['Vanilla Cloud',650],['Hazel Rush',650],['Ice Breaker',550]]},
      {t:'Snacks', k:'cookie', items:[['Chocolate Chip Cookie',250],['Dark Chocolate Cookie',300],['Oreo Cookie',300],['Banana Bread',200],['Plain Fudge Brownie',320],['Brookie',320],['Chocolate Tart',150],['Lemon Tart',150]]},
      {t:'Cakes', k:'cake', items:[['Chocolate Cake',300],['Coffee Cake',300],['Cheesecake',420]]},
      {t:'Desserts', k:'icecream', items:[['Waffle + Ice Cream',600],['Waffle + Brownie + Ice Cream',650],['Brownie + Ice Cream',420],['Chocolate Chip Cookie + Ice Cream',350],['Dark Chocolate Cookie + Ice Cream',400]]}
    ]},
  {id:'woks', area:'library', name:'Woke', p:'WK', hue:150, kind:'coffee', cat:'Coffee', tag:'Coffee and cookies', pop:1.9, rate:6, sample:true,
    menu:[{t:'Menu', k:'coffee', items:[['Espresso',200],['Americano',260],['Cappuccino',330],['Latte',350],['Chocolate Chip Cookie',170],['Oatmeal Cookie',170]]}]}
];
const CATS = ['All','Meals','Rolls & burgers','Desi','Chinese','Pizza','Snacks','Coffee','Drinks','Desserts'];
const PAYS = [{id:'easypaisa', name:'Easypaisa', paid:true},{id:'jazzcash', name:'JazzCash', paid:true},{id:'card', name:'Debit or credit card', paid:true},{id:'cash', name:'Cash at pickup', paid:false}];
const OPEN = 480, CLOSE = 1200, CASH_LIMIT = 500, HOLD = 15;
/* Typical demand through the day (0 to 1.2), used to simulate other customers */
const PROFILE = [[480,.3],[540,.45],[630,.65],[690,.6],[750,1.1],[810,1.15],[870,.75],[930,.5],[990,.7],[1050,.6],[1110,.4],[1200,.2]];

/* ---------- original food illustrations (simple flat shapes) ---------- */
const ICON = {
  burger:'<path d="M10 29c0-13 10-19 22-19s22 6 22 19z" fill="#F4B55E"/><circle cx="24" cy="19" r="1.3" fill="#FFF3D6"/><circle cx="33" cy="15" r="1.3" fill="#FFF3D6"/><circle cx="41" cy="20" r="1.3" fill="#FFF3D6"/><rect x="9" y="38" width="46" height="8" rx="4" fill="#7B4A2B"/><path d="M11 36h42l-9 7z" fill="#FFD23F"/><path d="M7 30h50v4c-4 4-8 4-12.5 0-4 4-8 4-12.5 0-4 4-8 4-12.5 0-4 4-8 4-12.5 0z" fill="#69BE5A"/><path d="M10 48h44v2a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8z" fill="#F4B55E"/>',
  roll:'<g transform="rotate(35 32 32)"><rect x="21" y="6" width="22" height="52" rx="11" fill="#F3D08F"/><circle cx="27" cy="13" r="3" fill="#69BE5A"/><circle cx="36" cy="11" r="3" fill="#E8483A"/><circle cx="32" cy="17" r="3" fill="#7B4A2B"/><path d="M21 30h22v17a11 11 0 0 1-22 0z" fill="#fff"/><path d="M21 31h22v5H21zM21 41h22v5H21z" fill="#DC2626"/></g>',
  pizza:'<path d="M32 58 9 16c14-8 32-8 46 0z" fill="#FFD23F"/><path d="M9 16c14-8 32-8 46 0" fill="none" stroke="#E09A3E" stroke-width="6" stroke-linecap="round"/><circle cx="26" cy="27" r="4" fill="#E8483A"/><circle cx="39" cy="29" r="4" fill="#E8483A"/><circle cx="32" cy="42" r="3.5" fill="#E8483A"/><circle cx="33" cy="21" r="1.8" fill="#69BE5A"/>',
  noodles:'<path d="M12 24c4-6 8 6 12 0s8 6 12 0 8 6 12 0l4 3v7H12z" fill="#FFD23F"/><path d="M41 6 31 31M49 8 37 31" stroke="#7B4A2B" stroke-width="2.4" stroke-linecap="round"/><path d="M6 32h52a26 22 0 0 1-52 0z" fill="#E8483A"/><rect x="24" y="52" width="16" height="4" rx="2" fill="#B91C1C"/>',
  rice:'<ellipse cx="32" cy="44" rx="27" ry="10" fill="#fff" stroke="#E7D8C8" stroke-width="2"/><path d="M12 42c0-14 9-22 20-22s20 8 20 22z" fill="#F6C453"/><circle cx="24" cy="32" r="2.2" fill="#E8483A"/><circle cx="38" cy="28" r="2.2" fill="#69BE5A"/><circle cx="34" cy="37" r="2.6" fill="#7B4A2B"/><circle cx="44" cy="37" r="1.8" fill="#E8483A"/>',
  curry:'<path d="M8 28h48a24 22 0 0 1-48 0z" fill="#44403C"/><ellipse cx="32" cy="28" rx="24" ry="7" fill="#D9682B"/><circle cx="24" cy="27" r="2" fill="#69BE5A"/><circle cx="39" cy="29" r="2.4" fill="#F6C453"/><circle cx="31" cy="30" r="1.8" fill="#69BE5A"/>',
  salad:'<path d="M8 30h48a24 22 0 0 1-48 0z" fill="#fff" stroke="#E7D8C8" stroke-width="2"/><circle cx="22" cy="27" r="8" fill="#69BE5A"/><circle cx="34" cy="24" r="9" fill="#4FA64B"/><circle cx="44" cy="28" r="7" fill="#69BE5A"/><circle cx="29" cy="28" r="3.5" fill="#E8483A"/><circle cx="41" cy="24" r="3" fill="#FFD23F"/>',
  samosa:'<path d="M32 10 56 50a3 3 0 0 1-3 4H11a3 3 0 0 1-3-4z" fill="#E8A548"/><path d="M14 49h36" stroke="#C9842E" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 5"/><circle cx="49" cy="18" r="6" fill="#69BE5A"/>',
  churro:'<g transform="rotate(-30 32 32)"><rect x="6" y="18" width="48" height="9" rx="4.5" fill="#D29A57"/><rect x="6" y="32" width="48" height="9" rx="4.5" fill="#D29A57"/><path d="M14 18v9M22 18v9M30 18v9M38 18v9M46 18v9M14 32v9M22 32v9M30 32v9M38 32v9M46 32v9" stroke="#B37A3A" stroke-width="1.5"/></g><circle cx="49" cy="49" r="9" fill="#4B2E1E"/><circle cx="49" cy="49" r="6" fill="#6B3F26"/>',
  donut:'<circle cx="32" cy="32" r="23" fill="#E0A45C"/><path d="M11 30a21 21 0 0 1 42 0c-4 5-7-1-11 3s-7-3-11 1-7-2-10 1-7-1-10-5z" fill="#F38BB2"/><circle cx="32" cy="32" r="7" fill="#FFF7ED"/><path d="M22 20l2 2M40 17l2 2M45 26l2-2M28 15l2-1" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  icecream:'<path d="M20 30h24L32 60z" fill="#E0A45C"/><path d="M24 36l14 8M22 32l18 11M40 36l-13 8" stroke="#C4873B" stroke-width="1.5"/><circle cx="24" cy="24" r="10" fill="#F8A9C6"/><circle cx="40" cy="24" r="10" fill="#FFF3D6"/><circle cx="32" cy="15" r="10" fill="#B88A6A"/>',
  coffee:'<path d="M17 22h30l-3 32a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z" fill="#fff" stroke="#E7D8C8" stroke-width="1.5"/><path d="M18.3 32h27.4l-1 11H19.3z" fill="#8A5A3B"/><rect x="14" y="15" width="36" height="8" rx="4" fill="#4B2E1E"/><path d="M27 10c-2-3 2-4 0-7M36 10c-2-3 2-4 0-7" stroke="#C9B8A8" stroke-width="2" fill="none" stroke-linecap="round"/>',
  shake:'<path d="M19 24h26l-4 30a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4z" fill="#F8A9C6"/><path d="M43 5 37 27" stroke="#DC2626" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="21" r="6" fill="#fff"/><circle cx="37" cy="21" r="6" fill="#fff"/><circle cx="32" cy="16" r="6" fill="#fff"/><circle cx="31" cy="9" r="3" fill="#E8483A"/>',
  soda:'<path d="M37 4 32 30" stroke="#DC2626" stroke-width="3" stroke-linecap="round"/><path d="M18 16h28l-4 38a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4z" fill="#8FD3F4" opacity=".9"/><path d="M19.5 30h25l-2.5 24a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4z" fill="#4FB6E8" opacity=".6"/><rect x="26" y="34" width="7" height="7" rx="1.5" fill="#fff" opacity=".85"/><rect x="33" y="44" width="6" height="6" rx="1.5" fill="#fff" opacity=".85"/><circle cx="47" cy="16" r="7" fill="#FFD23F"/><circle cx="47" cy="16" r="4" fill="#FFE98A"/>',
  chai:'<ellipse cx="30" cy="53" rx="22" ry="5" fill="#fff" stroke="#E7D8C8" stroke-width="1.5"/><circle cx="48" cy="34" r="7" fill="none" stroke="#fff" stroke-width="4.5"/><circle cx="48" cy="34" r="7" fill="none" stroke="#E7D8C8" stroke-width="1"/><path d="M12 24h36v10a18 18 0 0 1-36 0z" fill="#fff" stroke="#E7D8C8" stroke-width="1.5"/><ellipse cx="30" cy="24" rx="18" ry="4.5" fill="#C78A4A"/><path d="M24 16c-2-3 2-4 0-7M34 16c-2-3 2-4 0-7" stroke="#C9B8A8" stroke-width="2" fill="none" stroke-linecap="round"/>',
  cookie:'<circle cx="32" cy="32" r="23" fill="#D9A262"/><circle cx="23" cy="24" r="3.5" fill="#4B2E1E"/><circle cx="38" cy="22" r="3" fill="#4B2E1E"/><circle cx="42" cy="36" r="3.5" fill="#4B2E1E"/><circle cx="27" cy="41" r="3" fill="#4B2E1E"/><circle cx="33" cy="31" r="2.2" fill="#4B2E1E"/>',
  brownie:'<rect x="10" y="22" width="44" height="30" rx="5" fill="#5A3622"/><rect x="10" y="22" width="44" height="11" rx="5" fill="#7A4B2E"/><path d="M14 30c5 6 8-2 13 3s8-3 12 2 8-2 11 1" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".9"/>',
  cake:'<path d="M10 30 54 22v28H10z" fill="#F7E3C6"/><path d="M10 30 54 22v8L10 38z" fill="#7A4B2E"/><path d="M10 42 54 38v4L10 46z" fill="#C8433A"/><circle cx="46" cy="17" r="4.5" fill="#E8483A"/>',
  pastry:'<path d="M8 44c0-14 10-24 24-24s24 10 24 24v6H8z" fill="#E9B768"/><path d="M20 26c2 5 2 12 0 22M32 22c2 7 2 16 0 26M44 26c-2 5-2 12 0 22" stroke="#C98D3D" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  fries:'<path d="M22 9v26M28 6v28M34 9v25M40 6v28M45 10v24" stroke="#FFD23F" stroke-width="5" stroke-linecap="round"/><path d="M16 30h32l-4 24a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z" fill="#DC2626"/><circle cx="32" cy="44" r="5" fill="#FFD23F"/>',
  sandwich:'<path d="M8 50 32 12l24 38z" fill="#F3D9A4" stroke="#D9A860" stroke-width="2.5" stroke-linejoin="round"/><path d="M15 44h34" stroke="#69BE5A" stroke-width="4" stroke-linecap="round"/><path d="M19 37h26" stroke="#E8483A" stroke-width="4" stroke-linecap="round"/><path d="M24 30h16" stroke="#FFD23F" stroke-width="4" stroke-linecap="round"/>',
  paratha:'<circle cx="32" cy="33" r="23" fill="#EBC47E"/><path d="M18 33a14 14 0 1 0 28 0 10 10 0 1 0-20 0 6 6 0 1 0 12 0" fill="none" stroke="#C99645" stroke-width="2.2" stroke-linecap="round"/>',
  chicken:'<ellipse cx="26" cy="28" rx="18" ry="14" transform="rotate(-35 26 28)" fill="#C9772F"/><path d="M37 41 48 52" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="49" r="4" fill="#fff"/><circle cx="46" cy="54" r="4" fill="#fff"/>',
  dip:'<path d="M12 30h40l-4 20a6 6 0 0 1-6 5H22a6 6 0 0 1-6-5z" fill="#fff" stroke="#E7D8C8" stroke-width="2"/><ellipse cx="32" cy="30" rx="20" ry="6" fill="#E8483A"/>',
  water:'<rect x="25" y="5" width="14" height="7" rx="2" fill="#2D7FD3"/><path d="M23 14h18a4 4 0 0 1 4 4v36a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" fill="#8FD3F4"/><rect x="19" y="29" width="26" height="12" fill="#fff" opacity=".85"/>'
};
/* name patterns that override a section's default picture */
const KIND_RULES = [[/water/i,'water'],[/croissant(?! sandwich)|patties|\bpie\b|\bbun\b|calzone|pide|pizza bomb|bread pizza|bread roll|banana bread|chicken stick|chillos/i,'pastry'],[/brownie|brookie/i,'brownie'],[/cookie|biscuit|rusk/i,'cookie'],[/donut/i,'donut'],[/ice cream|scoop|lolly|gola|sundae/i,'icecream'],[/cake|pastry|tart|muffin/i,'cake'],[/churro/i,'churro'],[/samosa|spring roll|wonton|dumpling/i,'samosa'],[/salad/i,'salad'],[/burger|smash|husler(?! tortilla)/i,'burger'],[/sandwich|club\b/i,'sandwich'],[/shawarma|gyro|wrap|tortilla|\broll\b/i,'roll'],[/pizza/i,'pizza'],[/chow ?mein|noodle|pasta|lasagna|khaosuey|ramen/i,'noodles'],[/soup|karahi|qorma|daal|handi|ginger|vegetable$/i,'curry'],[/wings|tenders|pops|popcorn|strips|lollipop|boti box|steak|fish|prawns|dynamite chicken/i,'chicken'],[/rice|pulao|biryani|manchurian|shashlik|platter|chilli|szechuan|kung pao|bangkok|hong kong|beijing|hunan/i,'rice'],[/fries|salty|spicy|slims?\b/i,'fries'],[/paratha|chapati|bread$|pita/i,'paratha'],[/chai|tea\b|kahwa|dhood|doodh/i,'chai'],[/espresso|americano|cappuccino|latte|coffee|hot chocolate|vanilla cloud|hazel rush|ice breaker/i,'coffee'],[/shake/i,'shake'],[/soda|slush|juice|pepsi|7up|mirinda|gatorade|drink|margarita|lagoon|lemonade/i,'soda'],[/dip|sauce|extra cheese/i,'dip']];
/* relative kitchen work per item, so a chai and a rice plate are not counted as equal */
const WORK = {water:.2,soda:.4,chai:.4,coffee:.5,shake:.6,icecream:.3,cookie:.2,brownie:.2,cake:.3,donut:.3,pastry:.3,dip:.1,samosa:.5,salad:.7,fries:.7,paratha:.7,churro:.8,sandwich:.9,roll:1,burger:1.1,chicken:1.1,pizza:1.2,curry:1.2,noodles:1.3,rice:1.3};
