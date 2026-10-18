// Original story and scenarios. All amounts are integer minor currency units.
export const REGIONS = [
  {name:'Meadowbrook',subtitle:'Your first adventure',colour:'#CBDCC0',skill:'Earn · spend · choose',landmark:'village',intro:'The lanterns have gone quiet. Help Pip carry a new light across the valley.'},
  {name:'Willow Woods',subtitle:'A little planning goes far',colour:'#B7D1BB',skill:'Plan · save · prepare',landmark:'tree',intro:'A winding woodland trail. Pack carefully, cross the river and help the forest camp.'},
  {name:'Harbour Hollow',subtitle:'Make your money work',colour:'#C5DDD8',skill:'Compare · earn · share',landmark:'boat',intro:'The harbour is busy! Help the boat builders and bring light back to the docks.'},
  {name:'Cloudpeak',subtitle:'Ready for the unexpected',colour:'#D9DDCF',skill:'Borrow · protect · check',landmark:'mountain',intro:'The mountain trail needs teamwork. Keep a little aside for the unexpected.'},
  {name:'Lantern Isle',subtitle:'Bring the lights home',colour:'#D7E1C1',skill:'Balance · grow · give',landmark:'lighthouse',intro:'One final island. Build a fair, help your neighbours and relight the great lantern.'}
];
const choice=(label,icon,effect,outcome,wise=true)=>({label,icon,effect,outcome,wise});
const money=(title,question,concept,hint,choices)=>({type:'money',title,question,concept,hint,choices});
const play=(title,game,question)=>({type:'play',title,game,question,concept:'Adventure play',hint:'Take your time. Pip can help you finish.'});
export const LEVELS = [
 money('Pack your bag','Food for the trail. What will you pack?','Needs and wants','Food helps you travel. A shiny badge can wait.',[
  choice('Lunch + water','bag',{spend:600},'Your essentials are packed. There is money left for the journey.'),
  choice('Lunch + shiny badge','star',{spend:1400},'The badge is fun! It costs more, leaving less for later.',false),
  choice('Make a picnic','apple',{spend:300,days:2},'Making your own costs less, but takes an extra day.')]),
 money('The village workshop','A neighbour needs a hand. Choose a job.','Earning money','Look at both pay and time. Rest and play matter too.',[
  choice('Deliver a parcel','bag',{earn:1200},'A useful job earns money for your next stop.'),
  choice('Paint the sign','brush',{earn:1800,days:2},'More pay, but two days of food and camp costs.'),
  choice('Help + take a break','heart',{earn:800},'A smaller job leaves time to explore. Balance matters.')]),
 play('River hop','river','Hop across the stepping stones.'),
 money('Two market stalls','The same torch. Two different prices.','Comparing prices','Check the full price. Both torches work the same way.',[
  choice('Village stall','lamp',{spend:700},'You compared like for like and kept money for later.'),
  choice('Fancy wrapping','gift',{spend:1100},'The wrapping looks lovely, but the torch inside is the same.',false),
  choice('Borrow a torch','heart',{},'Borrowing with permission meets your need without buying.')]),
 money('Your first rainy-day jar','Keep some money safe for surprises.','Saving for later','A small amount saved now can help your future self.',[
  choice('Save 5','jar',{deposit:500},'Your rainy-day jar is growing. You can still use this money later.'),
  choice('Save 2','jar',{deposit:200},'A small start is still a start.'),
  choice('Keep it in my wallet','wallet',{},'It is available to spend. You can choose to save later.',false)]),
 play('Light the meadow beacon','repair','Turn the tiles. Join the path of light.'),
 money('Which woodland path?','A short toll road or a longer free trail?','Time and money','Every game day costs 2 for food and camp. A free road still takes time.',[
  choice('Bridge · 1 day','bridge',{spend:500,days:1},'The toll plus one day of living costs 7.'),
  choice('Forest · 3 days','tree',{days:3},'No toll. Three days of food and camp cost 6.'),
  choice('Ferry · 2 days','boat',{spend:400,days:2},'The fare plus two days of living costs 8.',false)]),
 money('A broken backpack','A strap has snapped. What now?','Repair and reuse','A repair can keep something useful going for longer.',[
  choice('Repair the strap','kit',{spend:400},'Your backpack is ready again. Repairing used fewer resources.'),
  choice('Buy a new bag','bag',{spend:1600},'A new bag works, but takes a bigger part of your budget.',false),
  choice('Ask the repair club','heart',{spend:200,days:2},'The club helps you mend it. You give your time as well as money.')]),
 play('Firefly meadow','catch','Move your lantern. Catch six fireflies.'),
 money('Camp activity pass','Choose a pass for three camp activities.','Budgeting for bills','Compare the whole pass, including the booking fee.',[
  choice('6 total · no fee','tent',{spend:600},'A clear total helps you make a plan.'),
  choice('4 + 5 booking fee','tent',{spend:900},'The small headline price had a fee. The full cost was 9.',false),
  choice('Help at camp · pay 2','brush',{spend:200,days:2},'You traded some time for a cheaper stay.')]),
 money('A gentle growing jar','The academy adds a saving bonus today.','Interest on savings','This is a pretend one-off 5% bonus, not a real account rate.',[
  choice('Keep my savings','jar',{interest:5},'Your saved money earned a small bonus. Growth takes patience.'),
  choice('Add 3, then grow','jar',{deposit:300,interest:5},'A little more saved means a little more bonus.'),
  choice('Take out up to 3','wallet',{withdraw:300},'Savings are useful when you need them. This choice has no bonus.',false)]),
 play('Find the forest lanterns','memory','Match the pictures to light the woods.'),
 money('Harbour helpers','Pick a job at the harbour.','Pay after expenses','The best-looking pay may have costs attached.',[
  choice('Dock job · earn 18','boat',{earn:1800},'No equipment fee. You keep the pay, then cover normal daily costs.'),
  choice('Photo job · 24, kit 10','scan',{earn:2400,spend:1000},'After the kit, 14 remains before daily costs.',false),
  choice('Garden job · earn 16','plant',{earn:1600},'A different job can be a good choice if you enjoy it.')]),
 money('The snack stall','Five equal snacks. Which pack?','Unit prices','Think about the cost for one snack.',[
  choice('5 for 5','apple',{spend:500},'Each snack costs 1. That is less per snack.'),
  choice('5 singles at 2','apple',{spend:1000},'Each costs 2. Buying five this way costs 10.',false),
  choice('Share a pack · pay 3','heart',{spend:300},'You share the cost and the food with a friend.')]),
 play('Harbour dash','maze','Guide Pip to the boat. Collect the key.'),
 money('The travelling club','Read a deal before joining.','Recurring costs','A subscription repeats. Count every payment.',[
  choice('One ticket · 4','flag',{spend:400},'One visit, one payment. The cost is clear.'),
  choice('3 payments of 2','flag',{spend:600},'Three payments add up to 6. All are taken now in this game.',false),
  choice('Free harbour walk','tree',{},'There are adventures you can enjoy without spending.')]),
 money('A community garden','The harbour is building a shared garden.','Giving within a budget','You can help with money or time. Keep enough for your own needs.',[
  choice('Give 3','heart',{spend:300,kindness:1},'Your gift helps the garden. Giving can be part of your plan.'),
  choice('Give some time','brush',{days:2,kindness:1},'Your effort helps too. Giving does not have to mean money.'),
  choice('Wish them well','plant',{},'It is okay to look after your own essentials first.')]),
 play('Light the harbour beacon','repair','Connect the lantern to the harbour.'),
 money('The mountain bike','Borrow 10 now and repay 12 later?','Borrowing and repayment','Borrowed money must be paid back. The extra 2 is the cost of borrowing.',[
  choice('Borrow 10 · owe 12','wallet',{borrow:1000,spend:1000,debt:1200},'The loan paid for the bike. You now owe 12. A repayment stop is ahead.',false),
  choice('Use my own money','bike',{spend:1000},'You pay now. There is no repayment later.'),
  choice('Walk with Pip','boots',{days:2},'You avoid borrowing, and the journey takes an extra day.')]),
 money('A storm on the trail','Your boots need a repair costing 5.','Emergency savings','This is the sort of surprise a rainy-day jar can help with.',[
  choice('Use savings first','jar',{emergency:500},'Your saved money helps. Your wallet covers anything extra.'),
  choice('Pay from my wallet','wallet',{spend:500},'The surprise costs 5. Your savings stay ready for another day.'),
  choice('Repair with the team','kit',{spend:200,days:2},'You spend less money and more time. Asking for help is useful.')]),
 play('Cloud glider','glider','Guide the glider through six sky gates.'),
 money('Too good to be true?','A stranger offers to double your coins.','Spotting scams','Promises of easy money and secret codes are warning signs.',[
  choice('Check with my grown-up','heart',{},'You kept your money and private details safe.'),
  choice('Walk away','boots',{},'You do not have to accept an offer.'),
  choice('Show Pip the message','robot',{},'Pip spots the warning signs. A trusted grown-up can help too.')]),
 money('Promises to keep','It is time to settle any bike borrowing.','Debt and total cost','A repayment uses money you cannot spend elsewhere.',[
  choice('Repay what I owe','wallet',{repay:true},'Your borrowing is settled. If you did not borrow, there is nothing to pay.'),
  choice('Savings, then repay','jar',{repay:true,useSavings:true},'Your savings help settle the promise. No borrowing means no repayment.'),
  choice('Ask for a payment plan','heart',{repay:true,days:2},'The academy helps organise the same repayment. Asking early helps.')]),
 play('Mountain trail','river','Find a safe route across the ridge.'),
 money('The island fair','Choose a plan for your little stall.','Business costs and profit','Profit is what remains after costs. These game sales are guaranteed; real sales are not.',[
  choice('Seeds: sell 18, cost 8','plant',{earn:1800,spend:800},'You made 10 before living costs. Sales and profit are different.'),
  choice('Bunting: sell 24, cost 18','flag',{earn:2400,spend:1800},'The bigger sales figure leaves 6 before living costs.',false),
  choice('Help a stall · earn 9','brush',{earn:900},'A fixed payment can be simpler than running your own stall.')]),
 money('Keep the receipt','A lantern is broken when you open it.','Checking purchases','Keep proof of purchase and ask a trusted grown-up for help.',[
  choice('Ask for a replacement','lamp',{},'The seller swaps the broken lantern in this story. Check real shop policies with a grown-up.'),
  choice('Repair it together','kit',{spend:200},'You have a working lantern. It was worth checking your options first.'),
  choice('Buy another one','lamp',{spend:900},'It works, but you paid again. Asking first might have saved money.',false)]),
 play('The lighthouse garden','memory','Match the island treasures.'),
 money('Something for now and later','Pip has paid you 15 for your island work.','Balancing spend, save and give','There is more than one thoughtful plan. Check what you need for later.',[
  choice('Save 8 · keep 7','jar',{earn:1500,deposit:800},'You split your pay between today and the future.'),
  choice('Save 5 · give 3 · keep 7','heart',{earn:1500,deposit:500,spend:300,kindness:1},'You made room for saving, giving and spending.'),
  choice('Keep all 15','wallet',{earn:1500},'Money in your wallet gives you choices. Decide before spending it.')]),
 money('Our final lantern','The lighthouse needs one last part.','Planning towards a goal','Choose a way that fits your wallet, savings and time.',[
  choice('Buy the part · 10','lamp',{spend:1000},'You used your journey money to finish something meaningful.'),
  choice('Use savings · 10','jar',{emergency:1000},'Saving helped you reach a goal. The wallet covers any shortfall.'),
  choice('Build it with Pip · 4','kit',{spend:400,days:2},'Teamwork, time and a smaller cost can reach the same goal.')]),
 play('The great lantern','repair','Bring light all the way to the lighthouse.')
].map((level,id)=>({...level,id,region:Math.floor(id/6),number:id+1}));
export const SUITS=['#EC7540','#13786E','#586CCA','#AD4B7F'];
export const EMBLEMS=['star','diamond','bolt'];
