
# Salesforce
Javascript API Client

## API
- Salesforce
  - [.authorize()](#authorizeobjmixedfnfunction)
  - [.logout()](#logoutfnfunction)
  - [.version()](#versionfnfunction)
  - [.describe()](#describeobjmixed-fnfunction)
  - [.sobjects()](#sobjectsobjmixed-fnfunction)
  - [.metadata()](#metadataobjmixed-fnfunction)
  - [.create()](#createobjmixed-fnfunction)
  - [.retrieve()](#retrieveobjmixed-fnfunction)
  - [.query()](#queryobjmixed-fnfunction)
  - [.update()](#updateobjmixed-fnfunction)
  - [.remove()](#removeobjmixed-fnfunction)
  - [.retrieveBlob()](#retrieveblobobjmixed-fnfunction)
  - [.retrieveExternal()](#retrieveexternalobjmixed-fnfunction)
  - [.upsertExternal()](#upsertexternalobjmixed-fnfunction)
  - [.searchQuery()](#searchqueryobjmixed-fnfunction)
  - [.searchScopeOrder()](#searchscopeorderfnfunction)
- Model
  - [mixin()](#mixin)
  - [.each()](#eachfnfunction)
  - [.pull()](#pulllimitnumber)
  - [.map()](#mapfnfunction)
  - [.select()](#selectfnfunctionstring)
  - [.unique()](#unique)
  - [.reject()](#rejectfnfunctionstringmixed)
  - [.compact()](#compact)
  - [.find()](#findfnfunction)
  - [.findLast()](#findlastfnfunction)
  - [.none()](#nonefnfunctionstring)
  - [.any()](#anyfnfunction)
  - [.count()](#countfnfunction)
  - [.indexOf()](#indexofobjmixed)
  - [.has()](#hasobjmixed)
  - [.reduce()](#reducefnfunction-valmixed)
  - [.max()](#maxfnfunctionstring)
  - [.sum()](#sumfnfunctionstring)
  - [.first()](#firstnnumberfunction)
  - [.last()](#lastnnumberfunction)
  - [.inGroupsOf()](#ingroupsofnnumber)
  - [.at()](#atinumber)
  - [.value()](#value)

## Salesforce

### .authorize(obj:Mixed, fn:Function)

### .logout(fn:Function)

### .version(fn:Function)

### .describe(obj:Mixed, fn:Function)

### .sobjects(fn:Function)

### .metadata(obj:Mixed, fn:Function)

### .create(obj:Mixed, fn:Function)

### .retrieve(obj:Mixed, fn:Function)

### .query(obj:Mixed, fn:Function)

### .update(obj:Mixed, fn:Function)

### .remove(obj:Mixed, fn:Function)

### .retrieveBlob(obj:Mixed, fn:Function)

### .retrieveExternal(obj:Mixed, fn:Function)

### .upsertExternal(obj:Mixed, fn:Function)

### .searchQuery(obj:Mixed, fn:Function)

### .searchScopeOrder(fn:Function)

## Model

  Model mixin.

```js
users
  .map('friends')
  .select('age > 20')
  .map('name.first')
  .select(/^T/)
```

### mixin()

  Mixin to `obj`.

```js
 var Model = require('model');
 Model(Something.prototype);
```

### .each(fn:Function)

  Iterate each value and invoke `fn(val, i)`.

```js
 users.each(function(val, i){

 })
```

### .pull(limit:Number)

  Return next set from last index to `limit`.

```js
 users.pull(5);
```

### .map(fn:Function)

  Map each return value from `fn(val, i)`.

  Passing a callback function:

```js
 users.map(function(user){
   return user.name.first
 })
```


  Passing a property string:

```js
 users.map('name.first')
```

### .select(fn:Function|String)

  Select all values that return a truthy value of `fn(val, i)`.

```js
 users.select(function(user){
   return user.age > 20
 })
```


   With a property:

```js
 items.select('complete')
```

### .unique()

  Select all unique values.

```js
 nums.unique()
```

### .reject(fn:Function|String|Mixed)

  Reject all values that return a truthy value of `fn(val, i)`.

  Rejecting using a callback:

```js
 users.reject(function(user){
   return user.age < 20
 })
```


  Rejecting with a property:

```js
 items.reject('complete')
```


  Rejecting values via `==`:

```js
 data.reject(null)
 users.reject(toni)
```

### .compact()

  Reject `null` and `undefined`.

```js
 [1, null, 5, undefined].compact()
 // => [1,5]
```

### .find(fn:Function)

  Return the first value when `fn(val, i)` is truthy,
  otherwise return `undefined`.

```js
 users.find(function(user){
   return user.role == 'admin'
 })
```

### .findLast(fn:Function)

  Return the last value when `fn(val, i)` is truthy,
  otherwise return `undefined`.

```js
 users.findLast(function(user){
   return user.role == 'admin'
 })
```

### .none(fn:Function|String)

  Assert that none of the invocations of `fn(val, i)` are truthy.

  For example ensuring that no pets are admins:

```js
 pets.none(function(p){ return p.admin })
 pets.none('admin')
```

### .any(fn:Function)

  Assert that at least one invocation of `fn(val, i)` is truthy.

  For example checking to see if any pets are ferrets:

```js
 pets.any(function(pet){
   return pet.species == 'ferret'
 })
```

### .count(fn:Function)

  Count the number of times `fn(val, i)` returns true.

```js
 var n = pets.count(function(pet){
   return pet.species == 'ferret'
 })
```

### .indexOf(obj:Mixed)

  Determine the indexof `obj` or return `-1`.

### .has(obj:Mixed)

  Check if `obj` is present in this model.

### .reduce(fn:Function, [val]:Mixed)

  Reduce with `fn(accumulator, val, i)` using
  optional `init` value defaulting to the first
  model value.

### .max(fn:Function|String)

  Determine the max value.

  With a callback function:

```js
 pets.max(function(pet){
   return pet.age
 })
```


  With property strings:

```js
 pets.max('age')
```


  With immediate values:

```js
 nums.max()
```

### .sum(fn:Function|String)

  Determine the sum.

  With a callback function:

```js
 pets.sum(function(pet){
   return pet.age
 })
```


  With property strings:

```js
 pets.sum('age')
```


  With immediate values:

```js
 nums.sum()
```

### .first([n]:Number|Function)

  Return the first value, or first `n` values.

### .last([n]:Number|Function)

  Return the last value, or last `n` values.

### .inGroupsOf(n:Number)

  Return values in groups of `n`.

### .at(i:Number)

  Return the value at the given index.

### .value()

  Return the model value.
