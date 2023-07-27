/**
 * Provides conversions from smart contract XDR values ({@link xdr.ScVal}) to
 * native JavaScript types.
 *
 * @example
 * ```js
 * import { nativeToScVal, scValToNative, ScInt, xdr } from 'stellar-base';
 *
 * let gigaMap = {
 *   bool: true,
 *   void: null,
 *   u32: xdr.ScVal.scvU32(1),
 *   i32: xdr.ScVal.scvI32(1),
 *   u64: 1n,
 *   i64: -1n,
 *   u128: new ScInt(1).toU128(),
 *   i128: new ScInt(1).toI128(),
 *   u256: new ScInt(1).toU256(),
 *   i256: new ScInt(1).toI256(),
 *   map: {
 *     arbitrary: 1n,
 *     nested: 'values',
 *     etc: false
 *   },
 *   vec: ['same', 'type', 'list'],
 * };
 *
 * // then, simply:
 * let scv = nativeToScVal(gigaMap);    // scv.switch() == xdr.ScValType.scvMap()
 *
 * // then...
 * someContract.call("method", scv);
 *
 * // Similarly, the inverse should work:
 * scValToNative(scv) == gigaMap;       // true
 * ```
 */

import { xdr } from "..";

import { Address } from "..";
import { Contract } from "..";
//@ts-ignore Does exist
import { ScInt, scValToBigInt } from "..";

export interface Union<T> {
  tag: string;
  value: T;
}

export class ContractSpec {
  public entries: xdr.ScSpecEntry[];
  constructor(entries: xdr.ScSpecEntry[] | string) {
    if (typeof entries === "string") {
      throw new Error("");
    } else {
      this.entries = entries;
    }
  }

  findEntry(name: string): xdr.ScSpecEntry {
    let entry = this.entries.find(
      (entry) => entry.value().name.toString() === name
    );
    if (!entry) {
      throw new Error(`no such entry: ${name}`);
    }
    return entry;
  }

  /**
   * Attempts to convert native types into smart contract values
   * ({@link xdr.ScVal}).
   *
   * The conversions are as follows:
   *
   *  - xdr.ScVal -> passthrough
   *  - null/undefined -> scvVoid
   *  - string -> scvString (a copy is made)
   *  - UintArray8 -> scvBytes (a copy is made)
   *  - boolean -> scvBool
   *
   *  - number/bigint -> the smallest possible XDR integer type that will fit the
   *    input value (if you want a specific type, use {@link ScInt})
   *
   *  - {@link Address} or {@link Contract} -> scvAddress (for contracts and
   *    public keys)
   *
   *  - Array<T> -> scvVec after attempting to convert each item of type `T` to an
   *    xdr.ScVal (recursively). note that all values must be the same type!
   *
   *  - object -> scvMap after attempting to convert each key and value to an
   *    xdr.ScVal (recursively). note that there is no restriction on types
   *    matching anywhere (unlike arrays)
   *
   * When passing an integer-like native value, you can also optionally specify a
   * type which will force a particular interpretation of that value.
   *
   * Note that not all type specifications are compatible with all `ScVal`s, e.g.
   * `toScVal("a string", {type: "i256"})` will throw.
   *
   * @param {any} val -       a native (or convertible) input value to wrap
   * @param {object} [opts] - an optional set of hints around the type of
   *    conversion you'd like to see
   * @param {string} [opts.type] - there is different behavior for different input
   *    types for `val`:
   *
   *     - when `val` is an integer-like type (i.e. number|bigint), this will be
   *       forwarded to {@link ScInt} or forced to be u32/i32.
   *
   *     - when `val` is an array type, this is forwarded to the recursion
   *
   *     - when `val` is an object type (key-value entries), this should be an
   *       object in which each key has a pair of types (to represent forced types
   *       for the key and the value), where `null` (or a missing entry) indicates
   *       the default interpretation(s) (refer to the examples, below)
   *
   *     - when `val` is a string type, this can be 'string' or 'symbol' to force
   *       a particular interpretation of `val`.
   *
   *     - when `val` is a bytes-like type, this can be 'string', 'symbol', or
   *       'bytes' to force a particular interpretation
   *
   *    As a simple example, `nativeToScVal("hello", {type: 'symbol'})` will
   *    return an `scvSymbol`, whereas without the type it would have been an
   *    `scvString`.
   *
   * @returns {xdr.ScVal} a wrapped, smart, XDR version of the input value
   *
   * @throws {TypeError} if...
   *  - there are arrays with more than one type in them
   *  - there are values that do not have a sensible conversion (e.g. random XDR
   *    types, custom classes)
   *  - the type of the input object (or some inner value of said object) cannot
   *    be determined (via `typeof`)
   *  - the type you specified (via `opts.type`) is incompatible with the value
   *    you passed in (`val`), e.g. `nativeToScVal("a string", { type: 'i128' })`,
   *    though this does not apply for types that ignore `opts` (e.g. addresses).
   *
   * @example
   *
   * ```js
   * nativeToScVal(1000);                   // gives ScValType === scvU64
   * nativeToScVal(1000n);                  // gives ScValType === scvU64
   * nativeToScVal(1n << 100n);             // gives ScValType === scvU128
   * nativeToScVal(1000, { type: 'u32' });  // gives ScValType === scvU32
   * nativeToScVal(1000, { type: 'i125' }); // gives ScValType === scvI256
   * nativeToScVal("a string");                     // gives ScValType === scvString
   * nativeToScVal("a string", { type: 'symbol' }); // gives scvSymbol
   * nativeToScVal(new Uint8Array(5));                      // scvBytes
   * nativeToScVal(new Uint8Array(5), { type: 'symbol' });  // scvSymbol
   * nativeToScVal(null); // scvVoid
   * nativeToScVal(true); // scvBool
   * nativeToScVal([1, 2, 3]);                    // gives scvVec with each element as scvU64
   * nativeToScVal([1, 2, 3], { type: 'i128' });  // scvVec<scvI128>
   * nativeToScVal({ 'hello': 1, 'world': [ true, false ] }, {
   *   type: {
   *     'hello': [ 'symbol', 'i128' ],
   *   }
   * })
   * // gives scvMap with entries: [
   * //     [ scvSymbol, scvI128 ],
   * //     [ scvString, scvArray<scvBool> ]
   * // ]
   * ```
   */
  nativeToScVal(val: any, typeDef?: xdr.ScSpecTypeDef): xdr.ScVal {
    if (typeDef?.switch().name === "scSpecTypeUdt") {
      let udt = typeDef.value() as xdr.ScSpecTypeUdt;
      return this.nativeToUdt(val, udt.name() as string);
    }

    switch (typeof val) {
      case "object": {
        if (val === null) {
          let ty = typeDef ?? xdr.ScSpecTypeDef.scSpecTypeVoid();
          switch (ty.switch().name) {
            case "scSpecTypeVoid":
            case "scSpecTypeOption":
              return xdr.ScVal.scvVoid();
            default:
              throw new TypeError(
                `Type ${ty} was not void, but value was null`
              );
          }
        }

        if (val instanceof xdr.ScVal) {
          return val; // should we copy?
        }

        if (val instanceof Address) {
          let ty = typeDef ?? xdr.ScSpecTypeDef.scSpecTypeAddress();
          if (ty.switch().value !== xdr.ScSpecType.scSpecTypeAddress().value) {
            throw new TypeError(
              `Type ${typeDef} was not address, but value was Address`
            );
          }
          return val.toScVal();
        }

        if (val instanceof Contract) {
          let ty = typeDef ?? xdr.ScSpecTypeDef.scSpecTypeAddress();
          if (ty.switch().value !== xdr.ScSpecType.scSpecTypeAddress().value) {
            throw new TypeError(
              `Type ${typeDef} was not address, but value was Address`
            );
          }
          return val.address().toScVal();
        }

        if (val instanceof Uint8Array || Buffer.isBuffer(val)) {
          const copy = Uint8Array.from(val);
          let ty = typeDef ?? xdr.ScSpecTypeDef.scSpecTypeBytes();
          switch (ty.switch().name) {
            case "scSpecTypeBytes":
            case "scSpecTypeBytesN":
              //@ts-ignore
              return xdr.ScVal.scvBytes(copy);
            case "scSpecTypeSymbol":
            case "scSpecTypeString":
              return stringToScVal(copy, ty);
            default:
              throw new TypeError(
                `invalid type (${typeDef}) specified for bytes-like value`
              );
          }
        }
        if (Array.isArray(val)) {
          let elementType: xdr.ScSpecTypeDef | undefined = undefined;
          // If type provided
          if (typeDef !== undefined) {
            if (typeDef.switch().name !== "scSpecTypeVec") {
              throw new TypeError(
                `Type ${typeDef} was not vec, but value was Array`
              );
            }
            let vec = typeDef.value() as xdr.ScSpecTypeVec;
            elementType = vec.elementType();
          } else {
            // otherwise ensure that the types of the values are all the same
            if (val.length > 0 && val.some((v) => typeof v !== typeof val[0])) {
              throw new TypeError(
                `array values (${val}) must have the same type (types: ${val
                  .map((v) => typeof v)
                  .join(",")})`
              );
            }
          }
          return xdr.ScVal.scvVec(
            val.map((v) => this.nativeToScVal(v, elementType))
          );
        }
        if (val.constructor === Map) {
          if (typeDef?.switch().name !== "scSpecTypeMap") {
            throw new TypeError(
              `Type ${typeDef} was not map, but value was Map`
            );
          }
          let scMap = typeDef!.value() as xdr.ScSpecTypeMap;
          let map = val as Map<any, any>;
          let entries: xdr.ScMapEntry[] = [];
          map.forEach(([k, v]) => {
            let key = this.nativeToScVal(k, scMap.keyType());
            let val = this.nativeToScVal(v, scMap.valueType());
            entries.push(new xdr.ScMapEntry({ key, val }));
          });
          return xdr.ScVal.scvMap(entries);
        }

        if ((val.constructor?.name ?? "") !== "Object") {
          throw new TypeError(
            `cannot interpret ${
              val.constructor?.name
            } value as ScVal (${JSON.stringify(val)})`
          );
        }

        return xdr.ScVal.scvMap(
          Object.entries(val).map(([k, v]) => {
            // the type can be specified with an entry for the key and the value,
            // e.g. val = { 'hello': 1 } and opts.type = { hello: [ 'symbol',
            // 'u128' ]} or you can use `undefined` for the default interpretation
            return new xdr.ScMapEntry({
              key: this.nativeToScVal(k, undefined),
              val: this.nativeToScVal(v, undefined),
            });
          })
        );
      }

      case "number":
      case "bigint": {
        let ty = typeDef ?? xdr.ScSpecTypeDef.scSpecTypeU32();
        switch (ty.switch().name) {
          case "scSpecTypeU32":
            return xdr.ScVal.scvU32(val as number);
          case "scSpecTypeI32":
            return xdr.ScVal.scvI32(val as number);
          case "scSpecTypeU64":
            return new ScInt(val, { type: "u64" }).toU64();
          case "scSpecTypeI64":
            return new ScInt(val, { type: "i64" }).toI64();
          case "scSpecTypeU128":
            return new ScInt(val, { type: "u128" }).toU128();
          case "scSpecTypeI128":
            return new ScInt(val, { type: "i128" }).toI128();
          case "scSpecTypeU256":
            return new ScInt(val, { type: "u256" }).toU256();
          case "scSpecTypeI256":
            return new ScInt(val, { type: "i256" }).toI256();
          default:
            throw new TypeError(`invalid type (${ty}) specified for integer`);
        }
      }
      case "string":
        return stringToScVal(
          val,
          typeDef ?? xdr.ScSpecTypeDef.scSpecTypeString()
        );

      case "boolean": {
        if (typeDef?.switch().name !== "scSpecTypeBool") {
          throw TypeError(`Type ${typeDef} was not bool, but value was bool`);
        }
        return xdr.ScVal.scvBool(val);
      }
      case "undefined": {
        if (!typeDef) {
          return xdr.ScVal.scvVoid();
        }
        switch (typeDef!.switch().name) {
          case "scSpecTypeVoid":
          case "scSpecTypeOption":
            return xdr.ScVal.scvVoid();
          default:
            throw new TypeError(
              `Type ${typeDef} was not void, but value was undefined`
            );
        }
      }

      case "function": // FIXME: Is this too helpful?
        return this.nativeToScVal(val(), typeDef);

      default:
        throw new TypeError(`failed to convert typeof ${typeof val} (${val})`);
    }
  }

  private nativeToUdt(val: any, name: string): xdr.ScVal {
    let entry = this.findEntry(name);
    switch (entry.switch()) {
      case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
        if (typeof val !== "number") {
          throw new TypeError(
            `expected number for enum ${name}, but got ${typeof val}`
          );
        }
        return this.nativeToEnum(
          val as number,
          entry.value() as xdr.ScSpecUdtEnumV0
        );
      case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
        return this.nativeToStruct(val, entry.value() as xdr.ScSpecUdtStructV0);
      case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
        return this.nativeToUnion(val, entry.value() as xdr.ScSpecUdtUnionV0);
      default:
        throw new Error(`failed to parse udt ${name}`);
    }
  }

  nativeToUnion(val: Union<any>, union_: xdr.ScSpecUdtUnionV0): xdr.ScVal {
    let entry_name = val.tag;
    let case_ = union_
      .cases()
      .find((entry) => entry.value().name() === entry_name);
    if (!case_) {
      throw new TypeError(`no such enum entry: ${entry_name} in ${union_}`);
    }
    let key = xdr.ScVal.scvString(entry_name);
    switch (case_.switch()) {
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0(): {
        return xdr.ScVal.scvVec([key]);
      }
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0(): {
        let types = (case_.value() as xdr.ScSpecUdtUnionCaseTupleV0).type();
        if (types.length == 1) {
          return xdr.ScVal.scvVec([
            key,
            this.nativeToScVal(val.value, types[0]),
          ]);
        }
        if (Array.isArray(val.value)) {
          if (val.value.length != types.length) {
            throw new TypeError(
              `union ${union_} expects ${types.length} values, but got ${val.value.length}`
            );
          }
          let scvals = val.value.map((v, i) => this.nativeToScVal(v, types[i]));
          scvals.unshift(key);
          return xdr.ScVal.scvVec(scvals);
        }
        throw new Error(`failed to parse union case ${case_} with ${val}`);
      }
      default:
        throw new Error(`failed to parse union ${union_} with ${val}`);
    }

    // enum_.cases()
  }

  nativeToStruct(val: any, struct: xdr.ScSpecUdtStructV0): xdr.ScVal {
    let fields = struct.fields();
    if (fields.some(isNumeric)) {
      if (!fields.every(isNumeric)) {
        throw new Error(
          "mixed numeric and non-numeric field names are not allowed"
        );
      }
      return xdr.ScVal.scvVec(
        fields.map((_, i) => this.nativeToScVal(val[i], fields[i].type()))
      );
    }
    return xdr.ScVal.scvMap(
      fields.map((field) => {
        let name = field.name() as string;
        if (Object.keys(val).includes(name)) {
          throw new Error(`missing field ${name} in ${struct}`);
        }
        return new xdr.ScMapEntry({
          key: this.nativeToScVal(name, xdr.ScSpecTypeDef.scSpecTypeString()),
          val: this.nativeToScVal(val[name], field.type()),
        });
      })
    );
  }

  nativeToEnum(val: number, enum_: xdr.ScSpecUdtEnumV0): xdr.ScVal {
    if (enum_.cases().some((entry) => entry.value() === val)) {
      return xdr.ScVal.scvU32(val);
    }
    throw new TypeError(`no such enum entry: ${val} in ${enum_}`);
  }

  /**
   * Given a smart contract value, attempt to convert to a native type.
   *
   * Possible conversions include:
   *
   *  - void -> null
   *  - u32, i32 -> number
   *  - u64, i64, u128, i128, u256, i256 -> bigint
   *  - vec -> array of any of the above (via recursion)
   *  - map -> key-value object of any of the above (via recursion)
   *  - bool -> boolean
   *  - bytes -> Uint8Array
   *  - string, symbol -> string|Uint8Array
   *
   * If no conversion can be made, this just "unwraps" the smart value to return
   * its underlying XDR value.
   *
   * @param {xdr.ScVal} scv - the input smart contract value
   *
   * @returns {any}
   */
  scValToNative<T>(scv: xdr.ScVal, typeDef: xdr.ScSpecTypeDef): T {
    if (typeDef.switch().name === "scSpecTypeUdt") {
      this.scValUdtToNative(scv, typeDef.value() as xdr.ScSpecTypeUdt);
    }
    // we use the verbose xdr.ScValType.<type>.value form here because it's faster
    // than string comparisons and the underlying constants never need to be
    // updated
    switch (scv.switch().value) {
      case xdr.ScValType.scvVoid().value:
        return void 0 as T;

      // these can be converted to bigints directly
      case xdr.ScValType.scvU64().value:
      case xdr.ScValType.scvI64().value:
      // these can be parsed by internal abstractions note that this can also
      // handle the above two cases, but it's not as efficient (another
      // type-check, parsing, etc.)
      case xdr.ScValType.scvU128().value:
      case xdr.ScValType.scvI128().value:
      case xdr.ScValType.scvU256().value:
      case xdr.ScValType.scvI256().value:
        return scValToBigInt(scv) as T;

      case xdr.ScValType.scvVec().value: {
        if (typeDef.switch().name !== "scSpecTypeVec") {
          throw new TypeError(`Type ${typeDef} was not vec, but ${scv} is`);
        }
        let vec = typeDef.value() as xdr.ScSpecTypeVec;
        return (scv.vec() ?? []).map((elm) =>
          this.scValToNative(elm, vec.elementType())
        ) as T;
      }

      case xdr.ScValType.scvAddress().value:
        return Address.fromScVal(scv) as T;

      case xdr.ScValType.scvMap().value: {
        let map = scv.map() ?? [];
        if (typeDef.switch().name === "scSpecTypeMap") {
          let type_ = typeDef.value() as xdr.ScSpecTypeMap;
          let keyType = type_.keyType();
          let valueType = type_.valueType();
          return new Map(
            map.map((entry) => [
              this.scValToNative(entry.key(), keyType),
              this.scValToNative(entry.val(), valueType),
            ])
          ) as T;
        }
        throw new TypeError(`Type ${typeDef} was not map, but ${scv} is`);
      }

      // these return the primitive type directly
      case xdr.ScValType.scvBool().value:
      case xdr.ScValType.scvU32().value:
      case xdr.ScValType.scvI32().value:
      case xdr.ScValType.scvBytes().value:
        return scv.value() as T;

      case xdr.ScValType.scvString().value:
      case xdr.ScValType.scvSymbol().value: {
        const v = scv.value();
        if (typeof v !== "string") {
          throw new Error(
            `Expected a string value from xdr but got ${v}: ${typeof v}`
          );
        }
        return v as T; // string
      }

      // these can be converted to bigint
      case xdr.ScValType.scvTimepoint().value:
      case xdr.ScValType.scvDuration().value:
        return scValToBigInt(xdr.ScVal.scvU64(scv.value() as xdr.Uint64)) as T;

      // case xdr.ScValType.scvStatus().value:
      //   // TODO: Convert each status type into a human-readable error string?
      //   switch (scv.value().switch()) {
      //     case xdr.ScStatusType.sstOk().value:
      //     case xdr.ScStatusType.sstUnknownError().value:
      //     case xdr.ScStatusType.sstHostValueError().value:
      //     case xdr.ScStatusType.sstHostObjectError().value:
      //     case xdr.ScStatusType.sstHostFunctionError().value:
      //     case xdr.ScStatusType.sstHostStorageError().value:
      //     case xdr.ScStatusType.sstHostContextError().value:
      //     case xdr.ScStatusType.sstVmError().value:
      //     case xdr.ScStatusType.sstContractError().value:
      //     case xdr.ScStatusType.sstHostAuthError().value:
      //     default:
      //       break;
      //   }

      // in the fallthrough case, just return the underlying value directly
      default:
        throw new TypeError(
          `failed to convert ${scv} to native type from type ${typeDef}`
        );
    }
  }

  scValUdtToNative(scv: xdr.ScVal, udt: xdr.ScSpecTypeUdt) {
    let entry = this.findEntry(udt.name() as string);
    switch (entry.switch()) {
      case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
        return this.enumToNative(scv, entry.value() as xdr.ScSpecUdtEnumV0);
      case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
        return this.structToNative(scv, entry.value() as xdr.ScSpecUdtStructV0);
      case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
        return this.unionToNative(scv, entry.value() as xdr.ScSpecUdtUnionV0);
      default:
        throw new Error(`failed to parse udt ${udt.name()}: ${entry}`);
    }
  }
  unionToNative(val: xdr.ScVal, udt: xdr.ScSpecUdtUnionV0) {
    throw new Error("Method not implemented.");
  }
  structToNative(val: xdr.ScVal, udt: xdr.ScSpecUdtStructV0) {
    throw new Error("Method not implemented.");
  }

  enumToNative(scv: xdr.ScVal, udt: xdr.ScSpecUdtEnumV0) {
    if (scv.switch().name !== "scvU32") {
      throw new Error(`Enum must have a u32 value`);
    }
    let num = scv.value() as number;
    if (udt.cases().some((entry) => entry.value() === num)) {
    }
    return num;
  }
}

function stringToScVal(
  str: string | Uint8Array,
  ty: xdr.ScSpecTypeDef
): xdr.ScVal {
  switch (ty.switch().name) {
    case "scSpecTypeString":
      return xdr.ScVal.scvString(str as string | Buffer);

    case "scSpecTypeSymbol":
      return xdr.ScVal.scvSymbol(str as string | Buffer);

    default:
      throw new TypeError(`invalid type (${ty}) specified for string value`);
  }
}

function isNumeric(field: xdr.ScSpecUdtStructFieldV0) {
  return /^\d+$/.test(field.name() as string);
}
