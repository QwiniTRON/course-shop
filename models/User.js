const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    mail: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String
    },
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseId: {
                    required: true,
                    type: Schema.Types.ObjectId,
                    ref: 'Course'
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(course){
    const items = [...this.cart.items];
    
    const idx = items.findIndex( c => String(c.courseId) === course._id.toString() );

    if(idx >= 0){
        items[idx].count++;
    }else{
        items.push({
            courseId: course._id,
            count: 1
        });
    }

    this.cart = {items};
    return this.save();
};

userSchema.methods.removeFromCart = function( id ){
    let items = [...this.cart.items];
    const idx = items.findIndex( c => c.courseId.toString() === id.toString() );

    if(items[idx].count == 1){
        items = items.filter( c => c.courseId.toString() !== id.toString() );
        
    }else{
        items[idx].count--;
    }

    this.cart = {items};
    
    return this.save();
}

userSchema.methods.clearCart = function (){
    this.cart = {items: []};
    return this.save();
};

module.exports = model("User", userSchema);
