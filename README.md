# fsm
刚毕业时,使用别人的js状态机库去控制页面渲染逻辑,感觉很合适,便自己也手写了个,其实还是蛮简单的(就是有点烂),不过主要是练练手,体会一下思想

var fsm = new FSM({
    initState: {//给定初始化状态,也可以传入对象{state:xxx,leave:xxx,enter:xxx}
        state: 'red'
    },
    states: [给定几个状态,也可以传入对象{event:xxx,before:xxx,after:xxx}
        'green', 'yellow'
    ],
    events: [给定几个事件
        'start', 'stop'
    ],
    transforms: [转移过程
        {
            state: 'red', 当前状态是什么
            event: 'start', 发生了什么事件
            method: f_xxxx, 这个时候会执行你传入的这个回调方法
            to: 'green',转移后的状态
        }
    ],
    generalMethod: {
        'leave': f_Xxx 通用的离开状态时的回调方法,类似还有enter.如果试图为单个状态指定该回调,需要在给定状态时,传入一个对象,key为leave
        'before':f_xxx 通用的执行事件前的回调方法,类似还有after.如果试图为单个状态指定该回调,同上
    }
});

fsm.triggerEvent(event)//触发事件
