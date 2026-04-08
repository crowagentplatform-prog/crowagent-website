Object.defineProperty(global,'localStorage',{value:{getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{}},writable:true}); test('basic', () => { expect(1).toBe(1); });
