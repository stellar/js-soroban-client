const xdr = SorobanClient.xdr;
const ScInt = SorobanClient.ScInt; // shorthand
const [scValToNative, nativeToScVal] = [
  SorobanClient.scValToNative,
  SorobanClient.nativeToScVal
];

describe('parsing and building ScVals', function () {

  it('Can parse entries', function () {
    
    let spec = new SorobanClient.ContractSpec([SorobanClient.STRUCT]);
    console.log(spec.findEntry('Test'))

  });

});


function custom_types_spec() {
  return SorobanClient.ContractSpec(xdr.Sp)
}



// const Test = 

//   UdtStructV0(
//       ScSpecUdtStructV0 {
//           doc: "This is from the rust doc above the struct Test",
//           lib: "",
//           name: "Test",
//           fields: VecM(
//               [
//                   new xdr.ScSpecUdtStructFieldV0({
//                       doc: "",
//                       name: "a",
//                       type: U32,
//                   },
//                   new xdr.ScSpecUdtStructFieldV0({
//                       doc: "",
//                       name: "b",
//                       type: Bool,
//                   },
//                   new xdr.ScSpecUdtStructFieldV0({
//                       doc: "",
//                       name: "c",
//                       type: Symbol,
//                   },
//               ],
//           ),
//       },
//   ),
// )
// UdtUnionV0(
//   ScSpecUdtUnionV0 {
//       doc: "",
//       lib: "",
//       name: "SimpleEnum",
//       cases: VecM(
//           [
//               VoidV0(
//                   ScSpecUdtUnionCaseVoidV0 {
//                       doc: "",
//                       name: "First",
//                   },
//               ),
//               VoidV0(
//                   ScSpecUdtUnionCaseVoidV0 {
//                       doc: "",
//                       name: "Second",
//                   },
//               ),
//               VoidV0(
//                   ScSpecUdtUnionCaseVoidV0 {
//                       doc: "",
//                       name: "Third",
//                   },
//               ),
//           ],
//       ),
//   },

//   UdtUnionV0(
//       ScSpecUdtUnionV0 {
//           doc: "",
//           lib: "",
//           name: "SimpleEnum",
//           cases: VecM(
//               [
//                   VoidV0(
//                       ScSpecUdtUnionCaseVoidV0 {
//                           doc: "",
//                           name: "First",
//                       },
//                   ),
//                   VoidV0(
//                       ScSpecUdtUnionCaseVoidV0 {
//                           doc: "",
//                           name: "Second",
//                       },
//                   ),
//                   VoidV0(
//                       ScSpecUdtUnionCaseVoidV0 {
//                           doc: "",
//                           name: "Third",
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// UdtEnumV0(
//   ScSpecUdtEnumV0 {
//       doc: "",
//       lib: "",
//       name: "RoyalCard",
//       cases: VecM(
//           [
//               ScSpecUdtEnumCaseV0 {
//                   doc: "",
//                   name: "Jack",
//                   value: 11,
//               },
//               ScSpecUdtEnumCaseV0 {
//                   doc: "",
//                   name: "Queen",
//                   value: 12,
//               },
//               ScSpecUdtEnumCaseV0 {
//                   doc: "",
//                   name: "King",
//                   value: 13,
//               },
//           ],
//       ),
//   },

//   UdtEnumV0(
//       ScSpecUdtEnumV0 {
//           doc: "",
//           lib: "",
//           name: "RoyalCard",
//           cases: VecM(
//               [
//                   ScSpecUdtEnumCaseV0 {
//                       doc: "",
//                       name: "Jack",
//                       value: 11,
//                   },
//                   ScSpecUdtEnumCaseV0 {
//                       doc: "",
//                       name: "Queen",
//                       value: 12,
//                   },
//                   ScSpecUdtEnumCaseV0 {
//                       doc: "",
//                       name: "King",
//                       value: 13,
//                   },
//               ],
//           ),
//       },
//   ),
// )
// UdtStructV0(
//   ScSpecUdtStructV0 {
//       doc: "",
//       lib: "",
//       name: "TupleStruct",
//       fields: VecM(
//           [
//               new xdr.ScSpecUdtStructFieldV0({
//                   doc: "",
//                   name: "0",
//                   type: Udt(
//                       ScSpecTypeUdt {
//                           name: "Test",
//                       },
//                   ),
//               }),
//               new xdr.ScSpecUdtStructFieldV0({
//                   doc: "",
//                   name: "1",
//                   type: Udt(
//                       ScSpecTypeUdt {
//                           name: "SimpleEnum",
//                       },
//                   ),
//               }),
//           ],
//       ),
//   },

//   UdtStructV0(
//       ScSpecUdtStructV0 {
//           doc: "",
//           lib: "",
//           name: "TupleStruct",
//           fields: VecM(
//               [
//                   new xdr.ScSpecUdtStructFieldV0({
//                       doc: "",
//                       name: "0",
//                       type: Udt(
//                           ScSpecTypeUdt {
//                               name: "Test",
//                           },
//                       ),
//                   },
//                   new xdr.ScSpecUdtStructFieldV0({
//                       doc: "",
//                       name: "1",
//                       type: Udt(
//                           ScSpecTypeUdt {
//                               name: "SimpleEnum",
//                           },
//                       ),
//                   },
//               ],
//           ),
//       },
//   ),
// )
// UdtUnionV0(
//   ScSpecUdtUnionV0 {
//       doc: "",
//       lib: "",
//       name: "ComplexEnum",
//       cases: VecM(
//           [
//               TupleV0(
//                   ScSpecUdtUnionCaseTupleV0 {
//                       doc: "",
//                       name: "Struct",
//                       type: VecM(
//                           [
//                               Udt(
//                                   ScSpecTypeUdt {
//                                       name: "Test",
//                                   },
//                               ),
//                           ],
//                       ),
//                   },
//               ),
//               TupleV0(
//                   ScSpecUdtUnionCaseTupleV0 {
//                       doc: "",
//                       name: "Tuple",
//                       type: VecM(
//                           [
//                               Udt(
//                                   ScSpecTypeUdt {
//                                       name: "TupleStruct",
//                                   },
//                               ),
//                           ],
//                       ),
//                   },
//               ),
//               TupleV0(
//                   ScSpecUdtUnionCaseTupleV0 {
//                       doc: "",
//                       name: "Enum",
//                       type: VecM(
//                           [
//                               Udt(
//                                   ScSpecTypeUdt {
//                                       name: "SimpleEnum",
//                                   },
//                               ),
//                           ],
//                       ),
//                   },
//               ),
//               TupleV0(
//                   ScSpecUdtUnionCaseTupleV0 {
//                       doc: "",
//                       name: "Asset",
//                       type: VecM(
//                           [
//                               Address,
//                               I128,
//                           ],
//                       ),
//                   },
//               ),
//               VoidV0(
//                   ScSpecUdtUnionCaseVoidV0 {
//                       doc: "",
//                       name: "Void",
//                   },
//               ),
//           ],
//       ),
//   },

//   UdtUnionV0(
//       ScSpecUdtUnionV0 {
//           doc: "",
//           lib: "",
//           name: "ComplexEnum",
//           cases: VecM(
//               [
//                   TupleV0(
//                       ScSpecUdtUnionCaseTupleV0 {
//                           doc: "",
//                           name: "Struct",
//                           type: VecM(
//                               [
//                                   Udt(
//                                       ScSpecTypeUdt {
//                                           name: "Test",
//                                       },
//                                   ),
//                               ],
//                           ),
//                       },
//                   ),
//                   TupleV0(
//                       ScSpecUdtUnionCaseTupleV0 {
//                           doc: "",
//                           name: "Tuple",
//                           type: VecM(
//                               [
//                                   Udt(
//                                       ScSpecTypeUdt {
//                                           name: "TupleStruct",
//                                       },
//                                   ),
//                               ],
//                           ),
//                       },
//                   ),
//                   TupleV0(
//                       ScSpecUdtUnionCaseTupleV0 {
//                           doc: "",
//                           name: "Enum",
//                           type: VecM(
//                               [
//                                   Udt(
//                                       ScSpecTypeUdt {
//                                           name: "SimpleEnum",
//                                       },
//                                   ),
//                               ],
//                           ),
//                       },
//                   ),
//                   TupleV0(
//                       ScSpecUdtUnionCaseTupleV0 {
//                           doc: "",
//                           name: "Asset",
//                           type: VecM(
//                               [
//                                   Address,
//                                   I128,
//                               ],
//                           ),
//                       },
//                   ),
//                   VoidV0(
//                       ScSpecUdtUnionCaseVoidV0 {
//                           doc: "",
//                           name: "Void",
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// UdtErrorEnumV0(
//   ScSpecUdtErrorEnumV0 {
//       doc: "",
//       lib: "",
//       name: "Error",
//       cases: VecM(
//           [
//               ScSpecUdtErrorEnumCaseV0 {
//                   doc: "Unknown error has occurred",
//                   name: "OhNo",
//                   value: 1,
//               },
//           ],
//       ),
//   },

//   UdtErrorEnumV0(
//       ScSpecUdtErrorEnumV0 {
//           doc: "",
//           lib: "",
//           name: "Error",
//           cases: VecM(
//               [
//                   ScSpecUdtErrorEnumCaseV0 {
//                       doc: "Unknown error has occurred",
//                       name: "OhNo",
//                       value: 1,
//                   },
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "hello",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "hello",
//                   type: Symbol,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Symbol,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "hello",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "hello",
//                       type: Symbol,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Symbol,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "woid",
//       ),
//       inputs: VecM(
//           [],
//       ),
//       outputs: VecM(
//           [],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "woid",
//           ),
//           inputs: VecM(
//               [],
//           ),
//           outputs: VecM(
//               [],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "val",
//       ),
//       inputs: VecM(
//           [],
//       ),
//       outputs: VecM(
//           [
//               Val,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "val",
//           ),
//           inputs: VecM(
//               [],
//           ),
//           outputs: VecM(
//               [
//                   Val,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "u32_fail_on_even",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "u32_",
//                   type: U32,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Result(
//                   ScSpecTypeResult {
//                       ok_type: U32,
//                       error_type: Error,
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "u32_fail_on_even",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "u32_",
//                       type: U32,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Result(
//                       ScSpecTypeResult {
//                           ok_type: U32,
//                           error_type: Error,
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "u32_",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "u32_",
//                   type: U32,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               U32,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "u32_",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "u32_",
//                       type: U32,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   U32,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "i32_",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "i32_",
//                   type: I32,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               I32,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "i32_",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "i32_",
//                       type: I32,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   I32,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "i64_",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "i64_",
//                   type: I64,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               I64,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "i64_",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "i64_",
//                       type: I64,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   I64,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "Example contract method which takes a struct",
//       name: ScSymbol(
//           "strukt_hel",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "strukt",
//                   type: Udt(
//                       ScSpecTypeUdt {
//                           name: "Test",
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Vec(
//                   ScSpecTypeVec {
//                       element_type: Symbol,
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "Example contract method which takes a struct",
//           name: ScSymbol(
//               "strukt_hel",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "strukt",
//                       type: Udt(
//                           ScSpecTypeUdt {
//                               name: "Test",
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Vec(
//                       ScSpecTypeVec {
//                           element_type: Symbol,
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "strukt",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "strukt",
//                   type: Udt(
//                       ScSpecTypeUdt {
//                           name: "Test",
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Udt(
//                   ScSpecTypeUdt {
//                       name: "Test",
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "strukt",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "strukt",
//                       type: Udt(
//                           ScSpecTypeUdt {
//                               name: "Test",
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Udt(
//                       ScSpecTypeUdt {
//                           name: "Test",
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "simple",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "simple",
//                   type: Udt(
//                       ScSpecTypeUdt {
//                           name: "SimpleEnum",
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Udt(
//                   ScSpecTypeUdt {
//                       name: "SimpleEnum",
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "simple",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "simple",
//                       type: Udt(
//                           ScSpecTypeUdt {
//                               name: "SimpleEnum",
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Udt(
//                       ScSpecTypeUdt {
//                           name: "SimpleEnum",
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "complex",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "complex",
//                   type: Udt(
//                       ScSpecTypeUdt {
//                           name: "ComplexEnum",
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Udt(
//                   ScSpecTypeUdt {
//                       name: "ComplexEnum",
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "complex",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "complex",
//                       type: Udt(
//                           ScSpecTypeUdt {
//                               name: "ComplexEnum",
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Udt(
//                       ScSpecTypeUdt {
//                           name: "ComplexEnum",
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "addresse",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "addresse",
//                   type: Address,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Address,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "addresse",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "addresse",
//                       type: Address,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Address,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "bytes",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "bytes",
//                   type: Bytes,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Bytes,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "bytes",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "bytes",
//                       type: Bytes,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Bytes,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "bytes_n",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "bytes_n",
//                   type: BytesN(
//                       ScSpecTypeBytesN {
//                           n: 9,
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               BytesN(
//                   ScSpecTypeBytesN {
//                       n: 9,
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "bytes_n",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "bytes_n",
//                       type: BytesN(
//                           ScSpecTypeBytesN {
//                               n: 9,
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   BytesN(
//                       ScSpecTypeBytesN {
//                           n: 9,
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "card",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "card",
//                   type: Udt(
//                       ScSpecTypeUdt {
//                           name: "RoyalCard",
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Udt(
//                   ScSpecTypeUdt {
//                       name: "RoyalCard",
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "card",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "card",
//                       type: Udt(
//                           ScSpecTypeUdt {
//                               name: "RoyalCard",
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Udt(
//                       ScSpecTypeUdt {
//                           name: "RoyalCard",
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "boolean",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "boolean",
//                   type: Bool,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Bool,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "boolean",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "boolean",
//                       type: Bool,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Bool,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "Negates a boolean value",
//       name: ScSymbol(
//           "not",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "boolean",
//                   type: Bool,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Bool,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "Negates a boolean value",
//           name: ScSymbol(
//               "not",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "boolean",
//                       type: Bool,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Bool,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "i128",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "i128",
//                   type: I128,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               I128,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "i128",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "i128",
//                       type: I128,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   I128,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "u128",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "u128",
//                   type: U128,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               U128,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "u128",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "u128",
//                       type: U128,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   U128,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "multi_args",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "a",
//                   type: U32,
//               },
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "b",
//                   type: Bool,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               U32,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "multi_args",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "a",
//                       type: U32,
//                   },
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "b",
//                       type: Bool,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   U32,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "map",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "map",
//                   type: Map(
//                       ScSpecTypeMap {
//                           key_type: U32,
//                           value_type: Bool,
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Map(
//                   ScSpecTypeMap {
//                       key_type: U32,
//                       value_type: Bool,
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "map",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "map",
//                       type: Map(
//                           ScSpecTypeMap {
//                               key_type: U32,
//                               value_type: Bool,
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Map(
//                       ScSpecTypeMap {
//                           key_type: U32,
//                           value_type: Bool,
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "vec",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "vec",
//                   type: Vec(
//                       ScSpecTypeVec {
//                           element_type: U32,
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Vec(
//                   ScSpecTypeVec {
//                       element_type: U32,
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "vec",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "vec",
//                       type: Vec(
//                           ScSpecTypeVec {
//                               element_type: U32,
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Vec(
//                       ScSpecTypeVec {
//                           element_type: U32,
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "tuple",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "tuple",
//                   type: Tuple(
//                       ScSpecTypeTuple {
//                           value_types: VecM(
//                               [
//                                   Symbol,
//                                   U32,
//                               ],
//                           ),
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Tuple(
//                   ScSpecTypeTuple {
//                       value_types: VecM(
//                           [
//                               Symbol,
//                               U32,
//                           ],
//                       ),
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "tuple",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "tuple",
//                       type: Tuple(
//                           ScSpecTypeTuple {
//                               value_types: VecM(
//                                   [
//                                       Symbol,
//                                       U32,
//                                   ],
//                               ),
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Tuple(
//                       ScSpecTypeTuple {
//                           value_types: VecM(
//                               [
//                                   Symbol,
//                                   U32,
//                               ],
//                           ),
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "Example of an optional argument",
//       name: ScSymbol(
//           "option",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "option",
//                   type: Option(
//                       ScSpecTypeOption {
//                           value_type: U32,
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Option(
//                   ScSpecTypeOption {
//                       value_type: U32,
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "Example of an optional argument",
//           name: ScSymbol(
//               "option",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "option",
//                       type: Option(
//                           ScSpecTypeOption {
//                               value_type: U32,
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Option(
//                       ScSpecTypeOption {
//                           value_type: U32,
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "u256",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "u256",
//                   type: U256,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               U256,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "u256",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "u256",
//                       type: U256,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   U256,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "i256",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "i256",
//                   type: I256,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               I256,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "i256",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "i256",
//                       type: I256,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   I256,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "string",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "string",
//                   type: String,
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               String,
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "string",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "string",
//                       type: String,
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   String,
//               ],
//           ),
//       },
//   ),
// )
// FunctionV0(
//   ScSpecFunctionV0 {
//       doc: "",
//       name: ScSymbol(
//           "tuple_strukt",
//       ),
//       inputs: VecM(
//           [
//               ScSpecFunctionInputV0 {
//                   doc: "",
//                   name: "tuple_strukt",
//                   type: Udt(
//                       ScSpecTypeUdt {
//                           name: "TupleStruct",
//                       },
//                   ),
//               },
//           ],
//       ),
//       outputs: VecM(
//           [
//               Udt(
//                   ScSpecTypeUdt {
//                       name: "TupleStruct",
//                   },
//               ),
//           ],
//       ),
//   },

//   FunctionV0(
//       ScSpecFunctionV0 {
//           doc: "",
//           name: ScSymbol(
//               "tuple_strukt",
//           ),
//           inputs: VecM(
//               [
//                   ScSpecFunctionInputV0 {
//                       doc: "",
//                       name: "tuple_strukt",
//                       type: Udt(
//                           ScSpecTypeUdt {
//                               name: "TupleStruct",
//                           },
//                       ),
//                   },
//               ],
//           ),
//           outputs: VecM(
//               [
//                   Udt(
//                       ScSpecTypeUdt {
//                           name: "TupleStruct",
//                       },
//                   ),
//               ],
//           ),
//       },
//   ),
// )

const CUSTOM_TYPES_XDR = ["AAAAAQAAAC9UaGlzIGlzIGZyb20gdGhlIHJ1c3QgZG9jIGFib3ZlIHRoZSBzdHJ1Y3QgVGVzdAAAAAAAAAAABFRlc3QAAAADAAAAAAAAAAFhAAAAAAAABAAAAAAAAAABYgAAAAAAAAEAAAAAAAAAAWMAAAAAAAAR",
  "AAAAAgAAAAAAAAAAAAAAClNpbXBsZUVudW0AAAAAAAMAAAAAAAAAAAAAAAVGaXJzdAAAAAAAAAAAAAAAAAAABlNlY29uZAAAAAAAAAAAAAAAAAAFVGhpcmQAAAA=",
  "AAAAAwAAAAAAAAAAAAAACVJveWFsQ2FyZAAAAAAAAAMAAAAAAAAABEphY2sAAAALAAAAAAAAAAVRdWVlbgAAAAAAAAwAAAAAAAAABEtpbmcAAAAN",
  "AAAAAQAAAAAAAAAAAAAAC1R1cGxlU3RydWN0AAAAAAIAAAAAAAAAATAAAAAAAAfQAAAABFRlc3QAAAAAAAAAATEAAAAAAAfQAAAAClNpbXBsZUVudW0AAA==",
  "AAAAAgAAAAAAAAAAAAAAC0NvbXBsZXhFbnVtAAAAAAUAAAABAAAAAAAAAAZTdHJ1Y3QAAAAAAAEAAAfQAAAABFRlc3QAAAABAAAAAAAAAAVUdXBsZQAAAAAAAAEAAAfQAAAAC1R1cGxlU3RydWN0AAAAAAEAAAAAAAAABEVudW0AAAABAAAH0AAAAApTaW1wbGVFbnVtAAAAAAABAAAAAAAAAAVBc3NldAAAAAAAAAIAAAATAAAACwAAAAAAAAAAAAAABFZvaWQ=",
  "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAQAAABpVbmtub3duIGVycm9yIGhhcyBvY2N1cnJlZAAAAAAABE9oTm8AAAAB",
  "AAAAAAAAAAAAAAAFaGVsbG8AAAAAAAABAAAAAAAAAAVoZWxsbwAAAAAAABEAAAABAAAAEQ==",
  "AAAAAAAAAAAAAAAEd29pZAAAAAAAAAAA",
  "AAAAAAAAAAAAAAADdmFsAAAAAAAAAAABAAAAAA==",
  "AAAAAAAAAAAAAAAQdTMyX2ZhaWxfb25fZXZlbgAAAAEAAAAAAAAABHUzMl8AAAAEAAAAAQAAA+kAAAAEAAAAAw==",
  "AAAAAAAAAAAAAAAEdTMyXwAAAAEAAAAAAAAABHUzMl8AAAAEAAAAAQAAAAQ=",
  "AAAAAAAAAAAAAAAEaTMyXwAAAAEAAAAAAAAABGkzMl8AAAAFAAAAAQAAAAU=",
  "AAAAAAAAAAAAAAAEaTY0XwAAAAEAAAAAAAAABGk2NF8AAAAHAAAAAQAAAAc=",
  "AAAAAAAAACxFeGFtcGxlIGNvbnRyYWN0IG1ldGhvZCB3aGljaCB0YWtlcyBhIHN0cnVjdAAAAApzdHJ1a3RfaGVsAAAAAAABAAAAAAAAAAZzdHJ1a3QAAAAAB9AAAAAEVGVzdAAAAAEAAAPqAAAAEQ==",
  "AAAAAAAAAAAAAAAGc3RydWt0AAAAAAABAAAAAAAAAAZzdHJ1a3QAAAAAB9AAAAAEVGVzdAAAAAEAAAfQAAAABFRlc3Q=",
  "AAAAAAAAAAAAAAAGc2ltcGxlAAAAAAABAAAAAAAAAAZzaW1wbGUAAAAAB9AAAAAKU2ltcGxlRW51bQAAAAAAAQAAB9AAAAAKU2ltcGxlRW51bQAA",
  "AAAAAAAAAAAAAAAHY29tcGxleAAAAAABAAAAAAAAAAdjb21wbGV4AAAAB9AAAAALQ29tcGxleEVudW0AAAAAAQAAB9AAAAALQ29tcGxleEVudW0A",
  "AAAAAAAAAAAAAAAIYWRkcmVzc2UAAAABAAAAAAAAAAhhZGRyZXNzZQAAABMAAAABAAAAEw==",
  "AAAAAAAAAAAAAAAFYnl0ZXMAAAAAAAABAAAAAAAAAAVieXRlcwAAAAAAAA4AAAABAAAADg==",
  "AAAAAAAAAAAAAAAHYnl0ZXNfbgAAAAABAAAAAAAAAAdieXRlc19uAAAAA+4AAAAJAAAAAQAAA+4AAAAJ",
  "AAAAAAAAAAAAAAAEY2FyZAAAAAEAAAAAAAAABGNhcmQAAAfQAAAACVJveWFsQ2FyZAAAAAAAAAEAAAfQAAAACVJveWFsQ2FyZAAAAA==",
  "AAAAAAAAAAAAAAAHYm9vbGVhbgAAAAABAAAAAAAAAAdib29sZWFuAAAAAAEAAAABAAAAAQ==",
  "AAAAAAAAABdOZWdhdGVzIGEgYm9vbGVhbiB2YWx1ZQAAAAADbm90AAAAAAEAAAAAAAAAB2Jvb2xlYW4AAAAAAQAAAAEAAAAB",
  "AAAAAAAAAAAAAAAEaTEyOAAAAAEAAAAAAAAABGkxMjgAAAALAAAAAQAAAAs=",
  "AAAAAAAAAAAAAAAEdTEyOAAAAAEAAAAAAAAABHUxMjgAAAAKAAAAAQAAAAo=",
  "AAAAAAAAAAAAAAAKbXVsdGlfYXJncwAAAAAAAgAAAAAAAAABYQAAAAAAAAQAAAAAAAAAAWIAAAAAAAABAAAAAQAAAAQ=",
  "AAAAAAAAAAAAAAADbWFwAAAAAAEAAAAAAAAAA21hcAAAAAPsAAAABAAAAAEAAAABAAAD7AAAAAQAAAAB",
  "AAAAAAAAAAAAAAADdmVjAAAAAAEAAAAAAAAAA3ZlYwAAAAPqAAAABAAAAAEAAAPqAAAABA==",
  "AAAAAAAAAAAAAAAFdHVwbGUAAAAAAAABAAAAAAAAAAV0dXBsZQAAAAAAA+0AAAACAAAAEQAAAAQAAAABAAAD7QAAAAIAAAARAAAABA==",
  "AAAAAAAAAB9FeGFtcGxlIG9mIGFuIG9wdGlvbmFsIGFyZ3VtZW50AAAAAAZvcHRpb24AAAAAAAEAAAAAAAAABm9wdGlvbgAAAAAD6AAAAAQAAAABAAAD6AAAAAQ=",
  "AAAAAAAAAAAAAAAEdTI1NgAAAAEAAAAAAAAABHUyNTYAAAAMAAAAAQAAAAw=",
  "AAAAAAAAAAAAAAAEaTI1NgAAAAEAAAAAAAAABGkyNTYAAAANAAAAAQAAAA0=",
  "AAAAAAAAAAAAAAAGc3RyaW5nAAAAAAABAAAAAAAAAAZzdHJpbmcAAAAAABAAAAABAAAAEA==",
  "AAAAAAAAAAAAAAAMdHVwbGVfc3RydWt0AAAAAQAAAAAAAAAMdHVwbGVfc3RydWt0AAAH0AAAAAtUdXBsZVN0cnVjdAAAAAABAAAH0AAAAAtUdXBsZVN0cnVjdAA="]