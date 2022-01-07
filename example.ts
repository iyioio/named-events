import { createEvent, createEventT, createValueEvent } from './named-events-index';

class ExampleClass
{
    
    private readonly _onBake=createEvent();
    public get onBake(){return this._onBake.evt}
    public shake(){
        this._onBake.trigger();
    }


    private readonly _onStringChange=createValueEvent<string>();
    public get onStringChange(){return this._onStringChange.evt}
    private _str:string='';
    public get str(){return this._str}
    public setStr(value:string){
        this._str=value;
        this._onStringChange.trigger(value);
    }


    private readonly _onGo=createEventT<(speed:'fast'|'slow',direction:'left'|'right')=>void>();
    public get onGo(){return this._onGo.evt}
    public go(speed:'fast'|'slow',direction:'left'|'right'){
        this._onGo.trigger(speed,direction);
    }

}

const obj=new ExampleClass();


// Empty event
const bakeListener=obj.onBake(()=>{
    console.log('Shake\'n Back')
})
obj.shake(); // triggers the listener
bakeListener(); // remove listener
obj.shake(); // listener not called because removed



// Value event
const stringListener=obj.onStringChange((newValue:string)=>{
    console.log(`I wanna go ${newValue}`);
})
obj.setStr('fast 🏎️'); // triggers the listener
stringListener(); // remove listener
obj.setStr('slow 🐌'); // listener not called because removed



// Custom Event
const goListener=obj.onGo((speed,direction)=>{
    console.log(`Go ${speed} turn ${direction}`);
})
obj.go('fast','left'); // triggers the listener
goListener(); // remove listener
obj.go('slow','right'); // listener not called because removed



// Using addListener and removeListener.
// addListener is slightly more resource efficiency since it does not return a callback to remove
// the listener, instead the listener must be removed using the removeListener function

const listener=(newValue:string)=>{
    console.log(`Baby ${newValue}`);
}
obj.onStringChange.addListener(listener);
obj.setStr('Jesus'); // triggers the listener
obj.onStringChange.removeListener(listener);
obj.setStr('Zeus'); // listener not called because removed
