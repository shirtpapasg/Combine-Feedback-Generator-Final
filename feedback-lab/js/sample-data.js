/* Sample P6 Forces paper — answer key + Google-Sheet-style student responses.
   This seeds the tool so it's usable immediately. Teachers paste their own
   key + responses over this (see the Setup panel). */
(function () {
  // --- MCQ answer key (1–30) ---
  const mcqKey = {
    1:"B",2:"C",3:"A",4:"D",5:"B",6:"A",7:"C",8:"D",9:"B",10:"A",
    11:"C",12:"B",13:"D",14:"A",15:"C",16:"B",17:"A",18:"D",19:"C",20:"B",
    21:"A",22:"D",23:"B",24:"C",25:"A",26:"D",27:"B",28:"C",29:"A",30:"D"
  };

  // --- Structured questions (1(a)–6(c)) with stems + marking points ---
  // type "explain" => answer requires explanation => use CECL "Question to ponder".
  const open = [
    { id:"1(a)", type:"short", stem:"Name the force that pulls the apple towards the ground.",
      marking:"Gravitational force (gravity). Accept 'gravitational force'." },
    { id:"1(b)", type:"explain", stem:"The same apple weighs less on the Moon than on Earth. Explain why.",
      marking:"Weight depends on the gravitational force acting on the object. The Moon's gravitational force (pull) is weaker than the Earth's, so the apple weighs less on the Moon." },
    { id:"2", type:"explain", stem:"A box does not move when Ben pushes it. Explain, in terms of forces, why the box stays still.",
      marking:"Frictional force acts between the box and the floor in the opposite direction to Ben's push. The frictional force balances (is equal to) Ben's push, so there is no overall force to move the box." },
    { id:"3(a)", type:"short", stem:"State one effect of a force acting on a moving trolley.",
      marking:"Any ONE: a force can speed it up / slow it down / change its direction / stop it / change its shape." },
    { id:"3(b)", type:"explain", stem:"Mei adds a rough mat under the trolley's wheels. Explain how this changes the trolley's motion.",
      marking:"A rougher surface increases the frictional force. The larger frictional force opposes the trolley's motion more, so the trolley slows down / is harder to move." },
    { id:"4", type:"explain", stem:"A spring stretches when a 100 g mass is hung on it. Explain why the spring returns to its original length when the mass is removed.",
      marking:"The stretched spring has an elastic spring force. When the mass is removed there is no longer a force stretching it, so the elastic spring force pulls/returns the spring back to its original length." },
    { id:"5(a)", type:"short", stem:"Name the type of force that acts between the two magnets shown.",
      marking:"Magnetic force." },
    { id:"5(b)", type:"explain", stem:"The two magnets push apart when brought near each other. Explain why.",
      marking:"Like poles are facing each other. Like poles repel, so the magnetic force pushes the two magnets apart." },
    { id:"6(a)", type:"short", stem:"On the diagram, the parachute is falling at a steady speed. Name the force acting upwards on the parachute.",
      marking:"Frictional force (the push of the air on the parachute). Accept frictional force." },
    { id:"6(b)", type:"explain", stem:"Explain why a parachutist falls more slowly with an open parachute than with a closed one.",
      marking:"An open parachute has a larger surface in contact with the air, so the upward frictional force from the air is larger. The larger upward force slows the parachutist down." },
    { id:"6(c)", type:"explain", stem:"Suggest why heavier objects are sometimes harder to start moving across a floor. Explain in terms of forces.",
      marking:"A heavier object presses down on the floor more, so the frictional force between the object and the floor is larger. A larger push is needed to overcome the larger frictional force before it moves." }
  ];

  // --- Students (as if collated from a Google Form -> Google Sheet) ---
  const students = [
    {
      name:"Kumar", className:"03",
      mcq:{1:"B",2:"C",3:"A",4:"D",5:"B",6:"A",7:"C",8:"D",9:"B",10:"A",11:"C",12:"B",13:"D",14:"A",15:"C",16:"B",17:"A",18:"D",19:"A",20:"B",21:"A",22:"D",23:"B",24:"C",25:"A",26:"D",27:"B",28:"C",29:"A",30:"D"},
      open:{
        "1(a)":"Gravitational force",
        "1(b)":"Because the moon is smaller so it has less gravity pulling the apple down, so the apple is lighter there.",
        "2":"The box is too heavy for Ben.",
        "3(a)":"It can make it go faster.",
        "3(b)":"The rough mat gives more friction so the trolley slows down because friction is bigger and pushes against it.",
        "4":"The spring is elastic so it goes back. The elastic spring force pulls it back to the start when you take the mass off.",
        "5(a)":"Magnetic force",
        "5(b)":"The like poles are facing so they repel and push apart.",
        "6(a)":"Air resistance",
        "6(b)":"The open parachute catches more air so there is more upward force from the air which slows him down.",
        "6(c)":"Heavier objects have more friction with the floor so you need a bigger push to move them."
      }
    },
    {
      name:"Tan", className:"05",
      mcq:{1:"B",2:"A",3:"A",4:"D",5:"C",6:"A",7:"C",8:"B",9:"B",10:"A",11:"C",12:"D",13:"D",14:"A",15:"C",16:"B",17:"C",18:"D",19:"C",20:"B",21:"A",22:"D",23:"A",24:"C",25:"A",26:"D",27:"D",28:"C",29:"A",30:"B"},
      open:{
        "1(a)":"Gravity",
        "1(b)":"Because there is no air on the moon.",
        "2":"There is friction between the box and the floor that pushes back the same as Ben's push, so it balances and the box does not move.",
        "3(a)":"Change its direction",
        "3(b)":"It makes more friction.",
        "4":"Because springs are bouncy.",
        "5(a)":"Magnetic force",
        "5(b)":"They have different poles so they attract.",
        "6(a)":"Frictional force",
        "6(b)":"",
        "6(c)":"Because they are heavy."
      }
    },
    {
      name:"Lim", className:"11",
      mcq:{1:"B",2:"C",3:"B",4:"D",5:"B",6:"C",7:"C",8:"D",9:"A",10:"A",11:"D",12:"B",13:"D",14:"A",15:"B",16:"B",17:"A",18:"D",19:"C",20:"A",21:"A",22:"C",23:"B",24:"C",25:"D",26:"D",27:"B",28:"A",29:"A",30:"D"},
      open:{
        "1(a)":"The pulling force",
        "1(b)":"",
        "2":"Because Ben is not strong.",
        "3(a)":"It stops.",
        "3(b)":"The trolley moves faster on the rough mat because rough helps it grip and go.",
        "4":"",
        "5(a)":"Pushing force",
        "5(b)":"Because magnets always push.",
        "6(a)":"",
        "6(b)":"The parachute is big.",
        "6(c)":""
      }
    }
  ];

  window.SAMPLE = { paper:"Primary 6 Science — Forces (Mid-Year Review)", className:"6 Resilience", mcqKey, open, students };
})();
