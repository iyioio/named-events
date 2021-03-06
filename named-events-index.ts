/**
 * An event listener that is called with a single argument that equals the current value of an event.
 */
export type ValueEventListener<T>=(value:T)=>void;

/**
 * An event listener that is called with no arguments
 */
export type EventListener=()=>void;

/**
 * Removes an event listener
 */
export type EventListenerRemover=()=>void;

/**
 * Adds an event listener and returns a function that removes the listener
 */
export type AddListenerCallback<TListener>=(listener:TListener)=>EventListenerRemover;

/**
 * An object that triggers events
 */
export interface NamedEventFuncs<TListener>
{

    readonly addListener:(listener:TListener)=>void;

    readonly removeListener:(listener:TListener)=>void;
}

export type NamedEventT<TListener>=NamedEventFuncs<TListener>&AddListenerCallback<TListener>;

export type NamedEvent=NamedEventT<EventListener>;

/**
 * An event source containing an event and a function to trigger the event
 */
export interface NamedEventSourceT<TListener>
{
    readonly evt:NamedEventT<TListener>;
    readonly trigger:TListener;
}

/**
 * An event source for events with not arguments
 */
export type NamedEventSource = NamedEventSourceT<EventListener>;

/**
 * An event source for events with a value
 */
export type NamedValueEventSource<TValue> = NamedEventSourceT<ValueEventListener<TValue>>;



/**
 * An event source for events with a value. The event source also tracks the current value and
 * allows the value to be returned using evt.getValue()
 */
export type NamedValueBackedEventSource<TValue> = NamedEventSourceT<ValueEventListener<TValue>> & {
    readonly getValue:()=>TValue;
    readonly setValue:(value:TValue|((currentValue:TValue)=>TValue))=>TValue;
    readonly evt:NamedEventT<ValueEventListener<TValue>> & {
        readonly getValue:()=>TValue;
    }
}

/**
 * Creates an event source for a custom listener type
 * @returns An event source
 */
export function createCustomEvent<TListener>():NamedEventSourceT<TListener>
{
    const listeners:TListener[]=[];
    const removeListener=(listener:TListener)=>
    {
        aryRemoveItem(listeners,listener);
    }
    const addListener=(listener:TListener)=>
    {
        listeners.push(listener);
    }
    const evt=(listener:TListener)=>
    {
        listeners.push(listener);
        return ()=>{
            removeListener(listener);
        }
    }
    evt.addListener=addListener;
    evt.removeListener=removeListener;
    return {
        evt,
        trigger:(
            (...args:any[])=>{
                if(listeners){
                    for(const l of listeners){
                        (l as any).apply(null,args);//eslint-disable-line
                    }
                }
            }
        ) as any
    };
}

/**
 * Creates an event source for a value event
 * @returns An event source
 */
export function createValueEvent<TValue>():NamedValueEventSource<TValue>
{
    return createCustomEvent();
}

/**
 * Creates an event source for a value event and stores the value.
 * @returns An event source
 */
export function createValueBackedEvent<TValue>(initValue:TValue):NamedValueBackedEventSource<TValue>
{
    let value:TValue=initValue;
    const listeners:ValueEventListener<TValue>[]=[];
    const removeListener=(listener:ValueEventListener<TValue>)=>
    {
        aryRemoveItem(listeners,listener);
    }
    const addListener=(listener:ValueEventListener<TValue>)=>
    {
        listeners.push(listener);
    }
    const evt=(listener:ValueEventListener<TValue>)=>
    {
        listeners.push(listener);
        return ()=>{
            removeListener(listener);
        }
    }
    const getValue=()=>value;
    const setValue=(v:TValue|((currentValue:TValue)=>TValue))=>{
        if(typeof v === 'function'){
            v=(v as any)(value);
        }
        if(v===value){
            return value;
        }
        value=v as any;
        if(listeners){
            for(const l of listeners){
                l(value)
            }
        }
        return value;
    }
    evt.addListener=addListener;
    evt.removeListener=removeListener;
    evt.getValue=getValue;
    return {
        evt,
        getValue,
        setValue,
        trigger:(
            (v:TValue)=>{
                if(v===value){
                    return;
                }
                value=v;
                if(listeners){
                    for(const l of listeners){
                        l(value)
                    }
                }
            }
        ) as any
    };
}

/**
 * Creates an event source for an event with no arguments
 * @returns EventListenerRemover
 */
export function createEvent():NamedEventSource
{
    return createCustomEvent();
}

/**
 * Returns a function that when called calls all of the remove listener functions passed in
 * @param listeners Remove listener callbacks to be called
 */
export function joinRemoveListeners(...listeners:(EventListenerRemover)[])
{
    return ()=>{
        if(listeners){
            for(const l of listeners){
                l();
            }
        }
    }
}

const aryRemoveItem=<T>(ary:T[],item:T):boolean=>
{
    if(!ary){
        return false;
    }
    for(let i=0;i<ary.length;i++){
        if(ary[i]===item){
            ary.splice(i,1);
            return true;
        }
    }
    return false;
}