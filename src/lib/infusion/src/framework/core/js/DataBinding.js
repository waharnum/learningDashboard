var fluid_2_0_0=fluid_2_0_0||{};!function($,fluid){"use strict";fluid.model.makeEnvironmentStrategy=function(environment){return function(root,segment,index){return 0===index&&environment[segment]?environment[segment]:void 0}},fluid.model.defaultCreatorStrategy=function(root,segment){return void 0===root[segment]?(root[segment]={},root[segment]):void 0},fluid.model.defaultFetchStrategy=function(root,segment){return root[segment]},fluid.model.funcResolverStrategy=function(root,segment){return root.resolvePathSegment?root.resolvePathSegment(segment):void 0},fluid.model.traverseWithStrategy=function(root,segs,initPos,config,uncess){for(var strategies=config.strategies,limit=segs.length-uncess,i=initPos;limit>i;++i){if(!root)return root;for(var accepted,j=0;j<strategies.length&&(accepted=strategies[j](root,segs[i],i+1,segs),void 0===accepted);++j);accepted===fluid.NO_VALUE&&(accepted=void 0),root=accepted}return root},fluid.model.getValueAndSegments=function(root,EL,config,initSegs){return fluid.model.accessWithStrategy(root,EL,fluid.NO_VALUE,config,initSegs,!0)},fluid.model.makeTrundler=function(config){return function(valueSeg,EL){return fluid.model.getValueAndSegments(valueSeg.root,EL,config,valueSeg.segs)}},fluid.model.getWithStrategy=function(root,EL,config,initSegs){return fluid.model.accessWithStrategy(root,EL,fluid.NO_VALUE,config,initSegs)},fluid.model.setWithStrategy=function(root,EL,newValue,config,initSegs){fluid.model.accessWithStrategy(root,EL,newValue,config,initSegs)},fluid.model.accessWithStrategy=function(root,EL,newValue,config,initSegs,returnSegs){if(fluid.isPrimitive(EL)||fluid.isArrayable(EL))return fluid.model.accessImpl(root,EL,newValue,config,initSegs,returnSegs,fluid.model.traverseWithStrategy);var key=EL.type||"default",resolver=config.resolvers[key];resolver||fluid.fail("Unable to find resolver of type "+key);var trundler=fluid.model.makeTrundler(config),valueSeg={root:root,segs:initSegs};return valueSeg=resolver(valueSeg,EL,trundler),EL.path&&valueSeg&&(valueSeg=trundler(valueSeg,EL.path)),returnSegs?valueSeg:valueSeg?valueSeg.root:void 0},fluid.registerNamespace("fluid.pathUtil"),fluid.pathUtil.getPathSegmentImpl=function(accept,path,i){var segment=null;accept&&(segment="");for(var escaped=!1,limit=path.length;limit>i;++i){var c=path.charAt(i);if(escaped)escaped=!1,null!==segment&&(segment+=c);else{if("."===c)break;"\\"===c?escaped=!0:null!==segment&&(segment+=c)}}return null!==segment&&(accept[0]=segment),i};var globalAccept=[];fluid.pathUtil.parseEL=function(path){for(var togo=[],index=0,limit=path.length;limit>index;){var firstdot=fluid.pathUtil.getPathSegmentImpl(globalAccept,path,index);togo.push(globalAccept[0]),index=firstdot+1}return togo},fluid.pathUtil.composeSegment=function(prefix,toappend){toappend=toappend.toString();for(var i=0;i<toappend.length;++i){var c=toappend.charAt(i);("."===c||"\\"===c||"}"===c)&&(prefix+="\\"),prefix+=c}return prefix},fluid.pathUtil.escapeSegment=function(segment){return fluid.pathUtil.composeSegment("",segment)},fluid.pathUtil.composePath=function(prefix,suffix){return 0!==prefix.length&&(prefix+="."),fluid.pathUtil.composeSegment(prefix,suffix)},fluid.pathUtil.composeSegments=function(){for(var path="",i=0;i<arguments.length;++i)path=fluid.pathUtil.composePath(path,arguments[i]);return path},fluid.pathUtil.matchSegments=function(toMatch,segs,start,end){if(end-start!==toMatch.length)return!1;for(var i=start;end>i;++i)if(segs[i]!==toMatch[i-start])return!1;return!0},fluid.model.unescapedParser={parse:fluid.model.parseEL,compose:fluid.model.composeSegments},fluid.model.defaultGetConfig={parser:fluid.model.unescapedParser,strategies:[fluid.model.funcResolverStrategy,fluid.model.defaultFetchStrategy]},fluid.model.defaultSetConfig={parser:fluid.model.unescapedParser,strategies:[fluid.model.funcResolverStrategy,fluid.model.defaultFetchStrategy,fluid.model.defaultCreatorStrategy]},fluid.model.escapedParser={parse:fluid.pathUtil.parseEL,compose:fluid.pathUtil.composeSegments},fluid.model.escapedGetConfig={parser:fluid.model.escapedParser,strategies:[fluid.model.defaultFetchStrategy]},fluid.model.escapedSetConfig={parser:fluid.model.escapedParser,strategies:[fluid.model.defaultFetchStrategy,fluid.model.defaultCreatorStrategy]},fluid.initRelayModel=function(that){return fluid.deenlistModelComponent(that),that.model},fluid.isModelComplete=function(that){return"model"in that&&that.model!==fluid.inEvaluationMarker},fluid.enlistModelComponent=function(that){var instantiator=fluid.getInstantiator(that),enlist=instantiator.modelTransactions.init[that.id];return enlist||(enlist={that:that,applier:fluid.getForComponent(that,"applier"),complete:fluid.isModelComplete(that)},instantiator.modelTransactions.init[that.id]=enlist),enlist},fluid.clearTransactions=function(){var instantiator=fluid.globalInstantiator;fluid.clear(instantiator.modelTransactions),instantiator.modelTransactions.init={}},fluid.failureEvent.addListener(fluid.clearTransactions,"clearTransactions","before:fail"),fluid.clearLinkCounts=function(transRec,relaysAlso){fluid.each(transRec,function(value,key){"number"==typeof value?transRec[key]=0:relaysAlso&&value.options&&"number"==typeof value.relayCount&&(value.relayCount=0)})},fluid.sortCompleteLast=function(reca,recb){return(reca.completeOnInit?1:0)-(recb.completeOnInit?1:0)},fluid.operateInitialTransaction=function(that,mrec){var transac,transId=fluid.allocateGuid(),transRec=fluid.getModelTransactionRec(that,transId),transacs=fluid.transform(mrec,function(recel){return transac=recel.that.applier.initiate(null,"init",transId),transRec[recel.that.applier.applierId]={transaction:transac},transac}),recs=fluid.values(mrec).sort(fluid.sortCompleteLast);fluid.each(recs,function(recel){var that=recel.that,transac=transacs[that.id];recel.completeOnInit?fluid.initModelEvent(that,that.applier,transac,that.applier.listeners.sortedListeners):fluid.each(recel.initModels,function(initModel){transac.fireChangeRequest({type:"ADD",segs:[],value:initModel}),fluid.clearLinkCounts(transRec,!0)});var shadow=fluid.shadowForComponent(that);shadow&&(shadow.modelComplete=!0)}),transac.commit()},fluid.deenlistModelComponent=function(that){var instantiator=fluid.getInstantiator(that),mrec=instantiator.modelTransactions.init;if(mrec[that.id]){that.model=void 0,mrec[that.id].complete=!0;var incomplete=fluid.find_if(mrec,function(recel){return recel.complete!==!0});incomplete||(fluid.operateInitialTransaction(that,mrec),instantiator.modelTransactions.init={})}},fluid.parseModelReference=function(that,ref){var parsed=fluid.parseContextReference(ref);return parsed.segs=that.applier.parseEL(parsed.path),parsed},fluid.parseValidModelReference=function(that,name,ref,implicitRelay){var parsed,reject=function(message){fluid.fail("Error in "+name+": ",ref,message)};if("string"==typeof ref)if(fluid.isIoCReference(ref)){parsed=fluid.parseModelReference(that,ref);var modelPoint=parsed.segs.indexOf("model");-1===modelPoint?implicitRelay?parsed.nonModel=!0:reject(' must be a reference into a component model via a path including the segment "model"'):(parsed.modelSegs=parsed.segs.slice(modelPoint+1),parsed.contextSegs=parsed.segs.slice(0,modelPoint),delete parsed.path)}else parsed={path:ref,modelSegs:that.applier.parseEL(ref)};else fluid.isArrayable(ref.segs)||reject(' must contain an entry "segs" holding path segments referring a model path within a component'),parsed={context:ref.context,modelSegs:fluid.expandOptions(ref.segs,that)};var target;return parsed.context?(target=fluid.resolveContext(parsed.context,that),target||reject(" must be a reference to an existing component"),parsed.contextSegs&&(target=fluid.getForComponent(target,parsed.contextSegs))):target=that,parsed.nonModel||(target.applier||fluid.getForComponent(target,["applier"]),target.applier||reject(" must be a reference to a component with a ChangeApplier (descended from fluid.modelComponent)")),parsed.that=target,parsed.applier=target.applier,parsed.path||(parsed.path=target.applier.composeSegments.apply(null,parsed.modelSegs)),parsed},fluid.getModelTransactionRec=function(that,transId){var instantiator=fluid.getInstantiator(that);if(transId||fluid.fail("Cannot get transaction record without transaction id"),!instantiator)return null;var transRec=instantiator.modelTransactions[transId];return transRec||(transRec=instantiator.modelTransactions[transId]={relays:[],sources:{},externalChanges:{}}),transRec},fluid.recordChangeListener=function(component,applier,sourceListener,listenerId){var shadow=fluid.shadowForComponent(component);fluid.recordListener(applier.modelChanged,sourceListener,shadow,listenerId)},fluid.registerRelayTransaction=function(transRec,targetApplier,transId,options,npOptions){var newTrans=targetApplier.initiate("relay",null,transId),transEl=transRec[targetApplier.applierId]={transaction:newTrans,relayCount:0,namespace:npOptions.namespace,priority:npOptions.priority,options:options};return transEl.priority=fluid.parsePriority(transEl.priority,transRec.relays.length,!1,"model relay"),transRec.relays.push(transEl),transEl},fluid.relayRecursionBailout=100,fluid.registerDirectChangeRelay=function(target,targetSegs,source,sourceSegs,linkId,transducer,options,npOptions){var targetApplier=options.targetApplier||target.applier,sourceApplier=options.sourceApplier||source.applier,applierId=targetApplier.applierId;targetSegs=fluid.makeArray(targetSegs),sourceSegs=sourceSegs?fluid.makeArray(sourceSegs):sourceSegs;var spec,sourceListener=function(newValue,oldValue,path,changeRequest,trans,applier){var transId=trans.id,transRec=fluid.getModelTransactionRec(target,transId);applier&&trans&&!transRec[applier.applierId]&&(transRec[applier.applierId]={transaction:trans});var existing=transRec[applierId];transRec[linkId]=transRec[linkId]||0;var relay=!0;relay&&(++transRec[linkId],transRec[linkId]>fluid.relayRecursionBailout&&fluid.fail("Error in model relay specification at component ",target," - operated more than "+fluid.relayRecursionBailout+" relays without model value settling - current model contents are ",trans.newHolder.model),existing||(existing=fluid.registerRelayTransaction(transRec,targetApplier,transId,options,npOptions)),transducer&&!options.targetApplier?transducer(existing.transaction,options.sourceApplier?void 0:newValue,sourceSegs,targetSegs):void 0!==newValue&&existing.transaction.fireChangeRequest({type:"ADD",segs:targetSegs,value:newValue}))};sourceSegs&&(spec=sourceApplier.modelChanged.addListener({isRelay:!0,segs:sourceSegs,transactional:options.transactional},sourceListener),fluid.log(fluid.logLevel.TRACE,"Adding relay listener with listenerId "+spec.listenerId+" to source applier with id "+sourceApplier.applierId+" from target applier with id "+applierId+" for target component with id "+target.id)),source&&(fluid.recordChangeListener(source,sourceApplier,sourceListener,spec.listenerId),target!==source&&fluid.recordChangeListener(target,sourceApplier,sourceListener,spec.listenerId))},fluid.connectModelRelay=function(source,sourceSegs,target,targetSegs,options){function enlistComponent(component){var enlist=fluid.enlistModelComponent(component);if(enlist.complete){var shadow=fluid.shadowForComponent(component);shadow.modelComplete&&(enlist.completeOnInit=!0)}}var linkId=fluid.allocateGuid();enlistComponent(target),enlistComponent(source);var npOptions=fluid.filterKeys(options,["namespace","priority"]);options.update?options.targetApplier?fluid.registerDirectChangeRelay(source,sourceSegs,target,targetSegs,linkId,null,{transactional:!1,targetApplier:options.targetApplier,update:options.update},npOptions):fluid.registerDirectChangeRelay(target,targetSegs,source,[],linkId+"-transform",options.forwardAdapter,{transactional:!0,sourceApplier:options.forwardApplier},npOptions):(fluid.registerDirectChangeRelay(target,targetSegs,source,sourceSegs,linkId,options.forwardAdapter,{transactional:!1},npOptions),sourceSegs&&fluid.registerDirectChangeRelay(source,sourceSegs,target,targetSegs,linkId,options.backwardAdapter,{transactional:!1},npOptions))},fluid.parseSourceExclusionSpec=function(targetSpec,sourceSpec){return targetSpec.excludeSource=fluid.arrayToHash(fluid.makeArray(sourceSpec.excludeSource||(sourceSpec.includeSource?"*":void 0))),targetSpec.includeSource=fluid.arrayToHash(fluid.makeArray(sourceSpec.includeSource)),targetSpec},fluid.isExcludedChangeSource=function(transaction,spec){if(!spec||!spec.excludeSource)return!1;var excluded=spec.excludeSource["*"];for(var source in transaction.fullSources)spec.excludeSource[source]&&(excluded=!0),spec.includeSource[source]&&(excluded=!1);return excluded},fluid.model.guardedAdapter=function(transaction,cond,func,args){fluid.isExcludedChangeSource(transaction,cond)||func.apply(null,args)},fluid.transformToAdapter=function(transform,targetPath){var basedTransform={};return basedTransform[targetPath]=transform,function(trans,newValue){fluid.model.transformWithRules(newValue,basedTransform,{finalApplier:trans})}},fluid.makeTransformPackage=function(componentThat,transform,sourcePath,targetPath,forwardCond,backwardCond,namespace,priority){var that={forwardHolder:{model:transform},backwardHolder:{model:null}};that.generateAdapters=function(trans){that.forwardAdapterImpl=fluid.transformToAdapter(trans?trans.newHolder.model:that.forwardHolder.model,targetPath),null!==sourcePath&&(that.backwardHolder.model=fluid.model.transform.invertConfiguration(transform),that.backwardAdapterImpl=fluid.transformToAdapter(that.backwardHolder.model,sourcePath))},that.forwardAdapter=function(transaction,newValue){void 0===newValue&&that.generateAdapters(),fluid.model.guardedAdapter(transaction,forwardCond,that.forwardAdapterImpl,arguments)},that.runTransform=function(trans){trans.commit(),trans.reset()},that.forwardApplier=fluid.makeHolderChangeApplier(that.forwardHolder),that.forwardApplier.isRelayApplier=!0,that.invalidator=fluid.makeEventFirer({name:"Invalidator for model relay with applier "+that.forwardApplier.applierId}),null!==sourcePath&&(that.backwardApplier=fluid.makeHolderChangeApplier(that.backwardHolder),that.backwardAdapter=function(transaction){fluid.model.guardedAdapter(transaction,backwardCond,that.backwardAdapterImpl,arguments)}),that.update=that.invalidator.fire;var implicitOptions={targetApplier:that.forwardApplier,update:that.update,namespace:namespace,priority:priority,refCount:0};return that.forwardHolder.model=fluid.parseImplicitRelay(componentThat,transform,[],implicitOptions),that.refCount=implicitOptions.refCount,that.namespace=namespace,that.priority=priority,that.generateAdapters(),that.invalidator.addListener(that.generateAdapters),that.invalidator.addListener(that.runTransform),that},fluid.singleTransformToFull=function(singleTransform){var withPath=$.extend(!0,{inputPath:""},singleTransform);return{"":{transform:withPath}}},fluid.model.relayConditions={initOnly:{includeSource:"init"},liveOnly:{excludeSource:"init"},never:{includeSource:[]},always:{}},fluid.model.parseRelayCondition=function(condition){"initOnly"===condition?fluid.log(fluid.logLevel.WARN,'The relay condition "initOnly" is deprecated: Please use the form \'includeSource: "init"\' instead'):"liveOnly"===condition&&fluid.log(fluid.logLevel.WARN,'The relay condition "initOnly" is deprecated: Please use the form \'excludeSource: "init"\' instead');var exclusionRec;return condition?"string"==typeof condition?(exclusionRec=fluid.model.relayConditions[condition],exclusionRec||fluid.fail('Unrecognised model relay condition string "'+condition+'": the supported values are "never" or a record with members "includeSource" and/or "excludeSource"')):exclusionRec=condition:exclusionRec={},fluid.parseSourceExclusionSpec({},exclusionRec)},fluid.parseModelRelay=function(that,mrrec,key){var parsedSource=mrrec.source?fluid.parseValidModelReference(that,'modelRelay record member "source"',mrrec.source):{path:null,modelSegs:null},parsedTarget=fluid.parseValidModelReference(that,'modelRelay record member "target"',mrrec.target),namespace=mrrec.namespace||key,transform=mrrec.singleTransform?fluid.singleTransformToFull(mrrec.singleTransform):mrrec.transform;transform||fluid.fail('Cannot parse modelRelay record without element "singleTransform" or "transform":',mrrec);var forwardCond=fluid.model.parseRelayCondition(mrrec.forward),backwardCond=fluid.model.parseRelayCondition(mrrec.backward),transformPackage=fluid.makeTransformPackage(that,transform,parsedSource.path,parsedTarget.path,forwardCond,backwardCond,namespace,mrrec.priority);0===transformPackage.refCount?fluid.connectModelRelay(parsedSource.that||that,parsedSource.modelSegs,parsedTarget.that,parsedTarget.modelSegs,fluid.filterKeys(transformPackage,["forwardAdapter","backwardAdapter","namespace","priority"])):(parsedSource.modelSegs&&fluid.fail('Error in model relay definition: If a relay transform has a model dependency, you can not specify a "source" entry - please instead enter this as "input" in the transform specification. Definition was ',mrrec," for component ",that),fluid.connectModelRelay(parsedSource.that||that,parsedSource.modelSegs,parsedTarget.that,parsedTarget.modelSegs,transformPackage))},fluid.parseImplicitRelay=function(that,modelRec,segs,options){var value;if(fluid.isIoCReference(modelRec)){var parsed=fluid.parseValidModelReference(that,"model reference from model (implicit relay)",modelRec,!0);parsed.nonModel?value=fluid.getForComponent(parsed.that,parsed.segs):(++options.refCount,fluid.connectModelRelay(that,segs,parsed.that,parsed.modelSegs,options))}else fluid.isPrimitive(modelRec)||!fluid.isPlainObject(modelRec)?value=modelRec:modelRec.expander&&fluid.isPlainObject(modelRec.expander)?value=fluid.expandOptions(modelRec,that):(value=fluid.freshContainer(modelRec),fluid.each(modelRec,function(innerValue,key){segs.push(key);var innerTrans=fluid.parseImplicitRelay(that,innerValue,segs,options);void 0!==innerTrans&&(value[key]=innerTrans),segs.pop()}));return value},fluid.model.notifyExternal=function(transRec){var allChanges=transRec?fluid.values(transRec.externalChanges):[];fluid.sortByPriority(allChanges);for(var i=0;i<allChanges.length;++i){var change=allChanges[i],targetApplier=change.args[5];targetApplier.destroyed||change.listener.apply(null,change.args)}fluid.clearLinkCounts(transRec,!0)},fluid.model.commitRelays=function(instantiator,transactionId){var transRec=instantiator.modelTransactions[transactionId];fluid.each(transRec,function(transEl){transEl.transaction&&(transEl.transaction.commit("relay"),transEl.transaction.reset())})},fluid.model.updateRelays=function(instantiator,transactionId){var transRec=instantiator.modelTransactions[transactionId],updates=0;return fluid.sortByPriority(transRec.relays),fluid.each(transRec.relays,function(transEl){transEl.transaction.changeRecord.changes>0&&transEl.relayCount<2&&transEl.options.update&&(transEl.relayCount++,fluid.clearLinkCounts(transRec),transEl.options.update(transEl.transaction,transRec),++updates)}),updates},fluid.establishModelRelay=function(that,optionsModel,optionsML,optionsMR,applier){function updateRelays(transaction){for(;fluid.model.updateRelays(instantiator,transaction.id)>0;);}function commitRelays(transaction,applier,code){"relay"!==code&&fluid.model.commitRelays(instantiator,transaction.id)}function concludeTransaction(transaction,applier,code){"relay"!==code&&(fluid.model.notifyExternal(instantiator.modelTransactions[transaction.id]),delete instantiator.modelTransactions[transaction.id])}var shadow=fluid.shadowForComponent(that);shadow.modelRelayEstablished?fluid.fail("FLUID-5887 failure: Model relay initialised twice on component",that):shadow.modelRelayEstablished=!0,fluid.mergeModelListeners(that,optionsML);var enlist=fluid.enlistModelComponent(that);fluid.each(optionsMR,function(mrrec,key){for(var i=0;i<mrrec.length;++i)fluid.parseModelRelay(that,mrrec[i],key)});var initModels=fluid.transform(optionsModel,function(modelRec){return fluid.parseImplicitRelay(that,modelRec,[],{refCount:0,priority:"first"})});enlist.initModels=initModels;var instantiator=fluid.getInstantiator(that);return applier.preCommit.addListener(updateRelays),applier.preCommit.addListener(commitRelays),applier.postCommit.addListener(concludeTransaction),null},fluid.defaults("fluid.modelComponent",{gradeNames:["fluid.component"],changeApplierOptions:{relayStyle:!0,cullUnchanged:!0},members:{model:"@expand:fluid.initRelayModel({that}, {that}.modelRelay)",applier:"@expand:fluid.makeHolderChangeApplier({that}, {that}.options.changeApplierOptions)",modelRelay:"@expand:fluid.establishModelRelay({that}, {that}.options.model, {that}.options.modelListeners, {that}.options.modelRelay, {that}.applier)"},mergePolicy:{model:{noexpand:!0,func:fluid.arrayConcatPolicy},modelListeners:fluid.makeMergeListenersPolicy(fluid.arrayConcatPolicy),modelRelay:fluid.makeMergeListenersPolicy(fluid.arrayConcatPolicy,!0)}}),fluid.modelChangedToChange=function(args){return{value:args[0],oldValue:args[1],path:args[2],transaction:args[4]}},fluid.event.invokeListener=function(listener,args,localRecord,mergeRecord){return"string"==typeof listener&&(listener=fluid.event.resolveListener(listener)),listener.apply(null,args,localRecord,mergeRecord)},fluid.resolveModelListener=function(that,record){var togo=function(){if(!fluid.isDestroyed(that)){var change=fluid.modelChangedToChange(arguments),args=arguments,localRecord={change:change,arguments:args},mergeRecord={source:Object.keys(change.transaction.sources)};record.args&&(args=fluid.expandOptions(record.args,that,{},localRecord)),fluid.event.invokeListener(record.listener,fluid.makeArray(args),localRecord,mergeRecord)}};return fluid.event.impersonateListener(record.listener,togo),togo},fluid.registerModelListeners=function(that,record,paths,namespace){var func=fluid.resolveModelListener(that,record);fluid.each(record.byTarget,function(parsedArray){function initModelEvent(){if(fluid.isModelComplete(parsed.that)){var trans=parsed.applier.initiate(null,"init");fluid.initModelEvent(that,parsed.applier,trans,[spec]),trans.commit()}}var parsed=parsedArray[0],spec={listener:func,listenerId:fluid.allocateGuid(),segsArray:fluid.getMembers(parsedArray,"modelSegs"),pathArray:fluid.getMembers(parsedArray,"path"),includeSource:record.includeSource,excludeSource:record.excludeSource,priority:fluid.expandOptions(record.priority,that),transactional:!0};if(spec=parsed.applier.modelChanged.addListener(spec,func,namespace,record.softNamespace),fluid.recordChangeListener(that,parsed.applier,func,spec.listenerId),that!==parsed.that&&!fluid.isModelComplete(that)){var onCreate=fluid.getForComponent(that,["events","onCreate"]);onCreate.addListener(initModelEvent)}})},fluid.mergeModelListeners=function(that,listeners){fluid.each(listeners,function(value,key){"string"==typeof value&&(value={funcName:value});var records=fluid.event.resolveListenerRecord(value,that,"modelListeners",null,!1).records;fluid.each(records,function(record){record.byTarget={};var paths=fluid.makeArray(void 0===record.path?key:record.path);fluid.each(paths,function(path){var parsed=fluid.parseValidModelReference(that,"modelListeners entry",path);fluid.pushArray(record.byTarget,parsed.that.id,parsed)});var namespace=(record.namespace&&!record.softNamespace?record.namespace:null)||(void 0!==record.path?key:null);fluid.registerModelListeners(that,record,paths,namespace)})})},fluid.fireChanges=function(applier,changes){for(var i=0;i<changes.length;++i)applier.fireChangeRequest(changes[i])},fluid.model.isChangedPath=function(changeMap,segs){for(var i=0;i<=segs.length;++i){if("string"==typeof changeMap)return!0;i<segs.length&&changeMap&&(changeMap=changeMap[segs[i]])}return!1},fluid.model.setChangedPath=function(options,segs,value){var notePath=function(record){segs.unshift(record),fluid.model.setSimple(options,segs,value),segs.shift()};fluid.model.isChangedPath(options.changeMap,segs)||(++options.changes,notePath("changeMap")),fluid.model.isChangedPath(options.deltaMap,segs)||(++options.deltas,notePath("deltaMap"))},fluid.model.fetchChangeChildren=function(target,i,segs,source,options){fluid.each(source,function(value,key){segs[i]=key,fluid.model.applyChangeStrategy(target,key,i,segs,value,options),segs.length=i})},fluid.model.isSameValue=function(a,b){if("number"!=typeof a||"number"!=typeof b)return a===b;if(a===b||a!==a&&b!==b)return!0;var relError=Math.abs((a-b)/b);return 1e-12>relError},fluid.model.applyChangeStrategy=function(target,name,i,segs,source,options){var targetSlot=target[name],sourceCode=fluid.typeCode(source),targetCode=fluid.typeCode(targetSlot),changedValue=fluid.NO_VALUE;"primitive"===sourceCode?fluid.model.isSameValue(targetSlot,source)||(changedValue=source,++options.unchanged):(targetCode!==sourceCode||"array"===sourceCode&&source.length!==targetSlot.length)&&(changedValue=fluid.freshContainer(source)),changedValue!==fluid.NO_VALUE&&(target[name]=changedValue,options.changeMap&&fluid.model.setChangedPath(options,segs,options.inverse?"DELETE":"ADD")),"primitive"!==sourceCode&&fluid.model.fetchChangeChildren(target[name],i+1,segs,source,options)},fluid.model.stepTargetAccess=function(target,type,segs,startpos,endpos,options){for(var i=startpos;endpos>i;++i)if(target){var oldTrunk=target[segs[i]];target=fluid.model.traverseWithStrategy(target,segs,i,options["ADD"===type?"resolverSetConfig":"resolverGetConfig"],segs.length-i-1),oldTrunk!==target&&options.changeMap&&fluid.model.setChangedPath(options,segs.slice(0,i+1),"ADD")}return{root:target,last:segs[endpos]}},fluid.model.defaultAccessorConfig=function(options){return options=options||{},options.resolverSetConfig=options.resolverSetConfig||fluid.model.escapedSetConfig,options.resolverGetConfig=options.resolverGetConfig||fluid.model.escapedGetConfig,options},fluid.model.applyHolderChangeRequest=function(holder,request,options){options=fluid.model.defaultAccessorConfig(options),options.deltaMap=options.changeMap?{}:null,options.deltas=0;var pen,length=request.segs.length,atRoot=0===length;if(atRoot?pen={root:holder,last:"model"}:(holder.model||(holder.model={},fluid.model.setChangedPath(options,[],options.inverse?"DELETE":"ADD")),pen=fluid.model.stepTargetAccess(holder.model,request.type,request.segs,0,length-1,options)),"ADD"===request.type){var value=request.value,segs=fluid.makeArray(request.segs);fluid.model.applyChangeStrategy(pen.root,pen.last,length-1,segs,value,options,atRoot)}else"DELETE"===request.type?pen.root&&void 0!==pen.root[pen.last]&&(delete pen.root[pen.last],options.changeMap&&fluid.model.setChangedPath(options,request.segs,"DELETE")):fluid.fail("Unrecognised change type of "+request.type);return options.deltas?options.deltaMap:null},fluid.model.diff=function(modela,modelb,options){options=options||{changes:0,unchanged:0,changeMap:{}};var togo,typea=fluid.typeCode(modela),typeb=fluid.typeCode(modelb);if("primitive"===typea&&"primitive"===typeb)togo=fluid.model.isSameValue(modela,modelb);else if("primitive"===typea^"primitive"===typeb)togo=!1;else{var holdera={model:fluid.copy(modela)};fluid.model.applyHolderChangeRequest(holdera,{value:modelb,segs:[],type:"ADD"},options);var holderb={model:fluid.copy(modelb)};options.inverse=!0,fluid.model.applyHolderChangeRequest(holderb,{value:modela,segs:[],type:"ADD"},options),togo=0===options.changes}return togo===!1&&0===options.changes?(options.changes=1,options.changeMap=void 0===modelb?"DELETE":"ADD"):togo===!0&&0===options.unchanged&&(options.unchanged=1),togo},fluid.matchChanges=function(changeMap,specSegs,newHolder){for(var root=newHolder.model,map=changeMap,outSegs=["model"],wildcard=!1,togo=[],i=0;i<specSegs.length;++i){var seg=specSegs[i];"*"===seg?i===specSegs.length-1?wildcard=!0:fluid.fail("Wildcard specification in modelChanged listener is only supported for the final path segment: "+specSegs.join(".")):(outSegs.push(seg),map=fluid.isPrimitive(map)?map:map[seg],root=root?root[seg]:void 0)}return map&&(wildcard?fluid.each(root,function(value,key){togo.push(outSegs.concat(key))}):togo.push(outSegs)),togo},fluid.storeExternalChange=function(transRec,applier,invalidPath,spec,args){var pathString=applier.composeSegments.apply(null,invalidPath),keySegs=[applier.holder.id,spec.listenerId,spec.wildcard?pathString:""],keyString=keySegs.join("|");transRec.externalChanges[keyString]={listener:spec.listener,namespace:spec.namespace,priority:spec.priority,args:args}},fluid.notifyModelChanges=function(listeners,changeMap,newHolder,oldHolder,changeRequest,transaction,applier,that){if(listeners)for(var transRec=transaction&&fluid.getModelTransactionRec(that,transaction.id),i=0;i<listeners.length;++i)for(var spec=listeners[i],multiplePaths=spec.segsArray.length>1,j=0;j<spec.segsArray.length;++j)for(var invalidPaths=fluid.matchChanges(changeMap,spec.segsArray[j],newHolder),k=0;k<invalidPaths.length;++k){if(applier.destroyed)return;var invalidPath=invalidPaths[k];spec.listener=fluid.event.resolveListener(spec.listener);var args=[multiplePaths?newHolder.model:fluid.model.getSimple(newHolder,invalidPath),multiplePaths?oldHolder.model:fluid.model.getSimple(oldHolder,invalidPath),multiplePaths?[]:invalidPath.slice(1),changeRequest,transaction,applier];if(!spec.isRelay){var isNull=fluid.model.diff(args[0],args[1]);if(isNull)continue;var sourceExcluded=fluid.isExcludedChangeSource(transaction,spec);if(sourceExcluded)continue}transRec&&!spec.isRelay&&spec.transactional?fluid.storeExternalChange(transRec,applier,invalidPath,spec,args):spec.listener.apply(null,args)}},fluid.bindELMethods=function(applier){applier.parseEL=function(EL){return fluid.model.pathToSegments(EL,applier.options.resolverSetConfig)},applier.composeSegments=function(){return applier.options.resolverSetConfig.parser.compose.apply(null,arguments)}},fluid.initModelEvent=function(that,applier,trans,listeners){fluid.notifyModelChanges(listeners,"ADD",trans.oldHolder,fluid.emptyHolder,null,trans,applier,that)},fluid.emptyHolder=fluid.freezeRecursive({model:void 0}),fluid.preFireChangeRequest=function(applier,changeRequest){changeRequest.type||(changeRequest.type="ADD"),changeRequest.segs=changeRequest.segs||applier.parseEL(changeRequest.path)},fluid.bindRequestChange=function(that){that.change=function(path,value,type,source){var changeRequest={path:path,value:value,type:type,source:source};that.fireChangeRequest(changeRequest)}},fluid.isObjectSimple=function(totest){return"[object Object]"===Object.prototype.toString.call(totest)},fluid.mergeChangeSources=function(target,globalSources){fluid.isObjectSimple(globalSources)?fluid.extend(target,globalSources):fluid.each(fluid.makeArray(globalSources),function(globalSource){target[globalSource]=!0})},fluid.ChangeApplier=function(){},fluid.makeHolderChangeApplier=function(holder,options){options=fluid.model.defaultAccessorConfig(options);var applierId=fluid.allocateGuid(),that=new fluid.ChangeApplier,name=fluid.isComponent(holder)?"ChangeApplier for component "+fluid.dumpThat(holder):"ChangeApplier with id "+applierId;return $.extend(that,{applierId:applierId,holder:holder,listeners:fluid.makeEventFirer({name:"Internal change listeners for "+name}),transListeners:fluid.makeEventFirer({name:"External change listeners for "+name}),options:options,modelChanged:{},preCommit:fluid.makeEventFirer({name:"preCommit event for "+name}),postCommit:fluid.makeEventFirer({name:"postCommit event for "+name})}),that.destroy=function(){that.preCommit.destroy(),that.postCommit.destroy(),that.destroyed=!0},that.modelChanged.addListener=function(spec,listener,namespace,softNamespace){spec="string"==typeof spec?{path:spec}:fluid.copy(spec),spec.listenerId=spec.listenerId||fluid.allocateGuid(),spec.namespace=namespace,spec.softNamespace=softNamespace,"string"==typeof listener&&(listener={globalName:listener}),spec.listener=listener,spec.transactional!==!1&&(spec.transactional=!0),spec.segsArray||(void 0!==spec.path&&(spec.segs=spec.segs||that.parseEL(spec.path)),spec.segsArray||(spec.segsArray=[spec.segs])),fluid.parseSourceExclusionSpec(spec,spec),
spec.wildcard=fluid.accumulate(fluid.transform(spec.segsArray,function(segs){return fluid.contains(segs,"*")}),fluid.add,0),spec.wildcard&&spec.segsArray.length>1&&fluid.fail("Error in model listener specification ",spec," - you may not supply a wildcard pattern as one of a set of multiple paths to be matched");var firer=that[spec.transactional?"transListeners":"listeners"];return firer.addListener(spec),spec},that.modelChanged.removeListener=function(listener){that.listeners.removeListener(listener),that.transListeners.removeListener(listener)},that.fireChangeRequest=function(changeRequest){var ation=that.initiate("local",changeRequest.source);ation.fireChangeRequest(changeRequest),ation.commit()},that.initiate=function(localSource,globalSources,transactionId){localSource="init"===globalSources?null:localSource||"local";var defeatPost="relay"===localSource,trans={instanceId:fluid.allocateGuid(),id:transactionId||fluid.allocateGuid(),changeRecord:{resolverSetConfig:options.resolverSetConfig,resolverGetConfig:options.resolverGetConfig},reset:function(){trans.oldHolder=holder,trans.newHolder={model:fluid.copy(holder.model)},trans.changeRecord.changes=0,trans.changeRecord.unchanged=0,trans.changeRecord.changeMap={}},commit:function(code){if(that.preCommit.fire(trans,that,code),trans.changeRecord.changes>0){var oldHolder={model:holder.model};holder.model=trans.newHolder.model,fluid.notifyModelChanges(that.transListeners.sortedListeners,trans.changeRecord.changeMap,holder,oldHolder,null,trans,that,holder)}defeatPost||that.postCommit.fire(trans,that,code)},fireChangeRequest:function(changeRequest){fluid.preFireChangeRequest(that,changeRequest),changeRequest.transactionId=trans.id;var deltaMap=fluid.model.applyHolderChangeRequest(trans.newHolder,changeRequest,trans.changeRecord);fluid.notifyModelChanges(that.listeners.sortedListeners,deltaMap,trans.newHolder,holder,changeRequest,trans,that,holder)},hasChangeSource:function(source){return trans.fullSources[source]}},transRec=fluid.getModelTransactionRec(holder,trans.id);return transRec&&(fluid.mergeChangeSources(transRec.sources,globalSources),trans.sources=transRec.sources,trans.fullSources=Object.create(transRec.sources),trans.fullSources[localSource]=!0),trans.reset(),fluid.bindRequestChange(trans),trans},fluid.bindRequestChange(that),fluid.bindELMethods(that),that}}(jQuery,fluid_2_0_0);