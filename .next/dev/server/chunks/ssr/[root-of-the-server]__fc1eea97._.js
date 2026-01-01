module.exports = [
"[project]/emi-tracker/pages/index.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
function getClosestDate(dueDay) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    let date = new Date(year, month, dueDay);
    if (date < today) {
        date = new Date(year, month + 1, dueDay);
    }
    return date;
}
function Home() {
    const [loans, setLoans] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({});
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        fetch('/api/loans').then((res)=>res.json()).then((data)=>setLoans(data));
    }, []);
    const handlePaidChange = (index, checked)=>{
        setLoans((loans)=>loans.map((loan, i)=>i === index ? {
                    ...loan,
                    paid: checked ? loan.emi : null
                } : loan));
        setEditing((editing)=>({
                ...editing,
                [index]: true
            }));
    };
    const handleSave = async ()=>{
        setLoading(true);
        await fetch('/api/loans', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loans)
        });
        setEditing({});
        setLoading(false);
    };
    // Calculate unpaid and total EMI
    const totalEmi = loans.reduce((sum, loan)=>sum + (Number(loan.emi) || 0), 0);
    const totalPaid = loans.reduce((sum, loan)=>sum + (Number(loan.paid) || 0), 0);
    const unpaidEmi = totalEmi - totalPaid;
    // Group loans by due_day
    const groups = {};
    loans.forEach((loan, idx)=>{
        if (!groups[loan.due_day]) groups[loan.due_day] = [];
        groups[loan.due_day].push({
            ...loan,
            idx
        });
    });
    const sortedDays = Object.keys(groups).sort((a, b)=>{
        const dateA = getClosestDate(Number(a));
        const dateB = getClosestDate(Number(b));
        return dateA - dateB;
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: 360,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '100%',
                        maxWidth: 360,
                        zIndex: 1000,
                        background: '#fff',
                        boxShadow: '0 2px 8px #ccc',
                        borderRadius: 0,
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600,
                        fontSize: 15,
                        gap: 12
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: 15,
                                color: '#333'
                            },
                            children: [
                                "₹",
                                unpaidEmi.toLocaleString(),
                                " / ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: '#0070f3',
                                        fontWeight: 700
                                    },
                                    children: [
                                        "₹",
                                        totalEmi.toLocaleString()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/emi-tracker/pages/index.js",
                                    lineNumber: 79,
                                    columnNumber: 45
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/emi-tracker/pages/index.js",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: handleSave,
                            disabled: loading || Object.keys(editing).length === 0,
                            style: {
                                marginLeft: 'auto',
                                background: '#0070f3',
                                color: 'white',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: 6,
                                fontWeight: 600,
                                fontSize: '14px',
                                boxShadow: '0 2px 8px #ccc'
                            },
                            children: loading ? 'Saving...' : 'Save'
                        }, void 0, false, {
                            fileName: "[project]/emi-tracker/pages/index.js",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: ()=>window.location.href = '/all-loans',
                            style: {
                                marginLeft: 8,
                                background: '#43a047',
                                color: 'white',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: 6,
                                fontWeight: 600,
                                fontSize: '14px',
                                boxShadow: '0 2px 8px #ccc',
                                cursor: 'pointer'
                            },
                            children: "Edit"
                        }, void 0, false, {
                            fileName: "[project]/emi-tracker/pages/index.js",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: async ()=>{
                                const code = window.prompt('Enter reset code:');
                                if (code === '3722') {
                                    const resetLoans = loans.map((loan)=>({
                                            ...loan,
                                            paid: 0
                                        }));
                                    setLoans(resetLoans);
                                    setEditing({});
                                    setLoading(true);
                                    await fetch('/api/loans', {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(resetLoans)
                                    });
                                    setLoading(false);
                                } else if (code !== null) {
                                    window.alert('Incorrect code. Reset cancelled.');
                                }
                            },
                            style: {
                                marginLeft: 8,
                                background: '#e53935',
                                color: 'white',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: 6,
                                fontWeight: 600,
                                fontSize: '14px',
                                boxShadow: '0 2px 8px #ccc',
                                cursor: 'pointer'
                            },
                            children: "Reset"
                        }, void 0, false, {
                            fileName: "[project]/emi-tracker/pages/index.js",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/emi-tracker/pages/index.js",
                    lineNumber: 60,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '80px 0 0 0',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 18,
                            marginTop: 18,
                            width: '100%'
                        },
                        children: [
                            sortedDays.map((day)=>{
                                const group = groups[day];
                                const groupDate = getClosestDate(Number(day));
                                const groupTotalEmi = group.reduce((sum, loan)=>sum + (Number(loan.emi) || 0), 0);
                                const groupTotalPaid = group.reduce((sum, loan)=>sum + (Number(loan.paid) || 0), 0);
                                // Determine border color: green if all paid, orange otherwise
                                const allPaid = groupTotalEmi > 0 && groupTotalEmi === groupTotalPaid;
                                const borderColor = allPaid ? '#2ecc40' : '#ff9800';
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        borderRadius: 18,
                                        background: '#f7f7f7',
                                        marginBottom: 0,
                                        padding: '14px 10px 10px 10px',
                                        boxShadow: '0 2px 12px #eee',
                                        border: `2.5px solid ${borderColor}`
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: 8,
                                                padding: '0 4px',
                                                fontWeight: 600,
                                                fontSize: 15
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "Due: ",
                                                        groupDate.toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/emi-tracker/pages/index.js",
                                                    lineNumber: 178,
                                                    columnNumber: 21
                                                }, this),
                                                allPaid ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: '#ff9800',
                                                        fontWeight: 600
                                                    },
                                                    children: [
                                                        "₹",
                                                        (groupTotalEmi - groupTotalPaid).toLocaleString(),
                                                        " left"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/emi-tracker/pages/index.js",
                                                    lineNumber: 180,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/emi-tracker/pages/index.js",
                                            lineNumber: 169,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 10
                                            },
                                            children: group.map((loan)=>{
                                                const paid = Number(loan.paid) === Number(loan.emi);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        background: '#fff',
                                                        borderRadius: 10,
                                                        boxShadow: '0 2px 8px #eee',
                                                        padding: 14,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-start',
                                                        position: 'relative',
                                                        marginBottom: 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                            style: {
                                                                position: 'absolute',
                                                                top: 10,
                                                                right: 10,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 4,
                                                                fontSize: 15,
                                                                fontWeight: 500
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                                    type: "checkbox",
                                                                    checked: paid,
                                                                    onChange: (e)=>handlePaidChange(loan.idx, e.target.checked),
                                                                    style: {
                                                                        width: 18,
                                                                        height: 18
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/emi-tracker/pages/index.js",
                                                                    lineNumber: 201,
                                                                    columnNumber: 29
                                                                }, this),
                                                                " Paid"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/emi-tracker/pages/index.js",
                                                            lineNumber: 200,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: '1.2rem',
                                                                fontWeight: 700,
                                                                marginBottom: 4
                                                            },
                                                            children: loan.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/emi-tracker/pages/index.js",
                                                            lineNumber: 208,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: '1.05rem',
                                                                color: '#0070f3',
                                                                marginBottom: 4
                                                            },
                                                            children: [
                                                                "₹",
                                                                Number(loan.emi).toLocaleString()
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/emi-tracker/pages/index.js",
                                                            lineNumber: 209,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, loan.idx, true, {
                                                    fileName: "[project]/emi-tracker/pages/index.js",
                                                    lineNumber: 189,
                                                    columnNumber: 25
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/emi-tracker/pages/index.js",
                                            lineNumber: 185,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, day, true, {
                                    fileName: "[project]/emi-tracker/pages/index.js",
                                    lineNumber: 161,
                                    columnNumber: 17
                                }, this);
                            }),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    height: 40
                                }
                            }, void 0, false, {
                                fileName: "[project]/emi-tracker/pages/index.js",
                                lineNumber: 218,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/emi-tracker/pages/index.js",
                        lineNumber: 151,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/emi-tracker/pages/index.js",
                    lineNumber: 149,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/emi-tracker/pages/index.js",
            lineNumber: 59,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/emi-tracker/pages/index.js",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fc1eea97._.js.map