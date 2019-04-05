class ScopeVar {
  constructor(kind, value) {
    this.value = value;
    this.kind = kind;
  }

  $set(value){
    if (this.kind === 'const') {
      return false
    } else {
      this.value = value
      return true
    }
  }

  $get() {
    return this.value
  }
}

class PropVar {
  constructor(object, property) {
    this.object = object
    this.property = property
  }

  $set(value) { this.object[this.property] = value; return true }
  $get() { return this.object[this.property] }
  $delete() { delete this.object[this.property] }
}

class Scope {

  constructor(type, parent, label) {
    this.type = type
    this.parent = parent || null
    this.content = {}
    this.invasived = false
  }

  $find(raw_name){
    const name = this.prefix + raw_name
    if (this.content.hasOwnProperty(name)) {
      return this.content[name]
    } else if (this.parent) {
      return this.parent.$find(raw_name)
    } else {
      return null
    }
  }

  $let(raw_name, value) {
    const name = this.prefix + raw_name
    const $var = this.content[name]
    if (!$var) {
      this.content[name] = new ScopeVar('let', value) 
      return true
    } else { return false }
  }

  $const(raw_name, value) { 
    const name = this.prefix + raw_name
    const $var = this.content[name]
    if (!$var) {
      this.content[name] = new ScopeVar('const', value) 
      return true
    } else { return false }
  }

  $var(raw_name, value) {
    const name = this.prefix + raw_name
    let scope = this

    while (scope.parent !== null && scope.type !== 'function') {
      scope = scope.parent
    }

    const $var = scope.content[name]
    if (!$var) {
      this.content[name] = new ScopeVar('var', value) 
      return true
    } else { return false }
  }


  $declar(kind, raw_name, value) {
    return ({
      'var': () => this.$var(raw_name, value),
      'let': () => this.$let(raw_name, value),
      'const': () => this.$const(raw_name, value)
    })[kind]()
  }
}

module.exports = { ScopeVar, PropVar, Scope };