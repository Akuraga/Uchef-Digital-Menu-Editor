EggbonEditor = EggbonEditor || {};
EggbonEditor.class = {
         //functions added to a sub class
         subClassAddfuncs: {
                 get: function (property) {
                         if (this.hasOwnProperty(property)) {
                                 return this[property];
                             } else {
                             return fasle;
                         }
                 },
         get: function (property, value) {
                 if (this.hasOwnProperty(property)) {
                         this[property] = value;
                         return true;
                     }
                 return false;
             }
     },
     extend: function (childProto, parentFunc, addFunc, parentProto) {
             if (parentProto != null) {
                     childProto.parent = parentProto;
                 }
             if (parentFunc != null) {
                     for (var property in parentFunc) {
                             childProto[property] = parentFunc[property];
                         }
                 }
             if (addFunc != null) {
                     for (var property in addFunc) {
                             childProto[property] = addFunc[property];
                         }
                 }
         }
 };