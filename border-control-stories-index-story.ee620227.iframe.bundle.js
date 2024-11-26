"use strict";(self.webpackChunkgutenberg=self.webpackChunkgutenberg||[]).push([[6846],{"./packages/components/src/border-control/stories/index.story.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,IsCompact:()=>IsCompact,WithMultipleOrigins:()=>WithMultipleOrigins,WithSlider:()=>WithSlider,WithSliderCustomWidth:()=>WithSliderCustomWidth,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/index.js"),___WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/components/src/border-control/border-control/component.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/jsx-runtime.js");const __WEBPACK_DEFAULT_EXPORT__={title:"Components/BorderControl",component:___WEBPACK_IMPORTED_MODULE_1__.A,argTypes:{onChange:{action:"onChange"},width:{control:{type:"text"}},value:{control:{type:null}}},parameters:{sourceLink:"packages/components/src/border-control",badges:[],controls:{expanded:!0},docs:{canvas:{sourceState:"shown"}}}},Template=({onChange,...props})=>{const[border,setBorder]=(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)();return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(___WEBPACK_IMPORTED_MODULE_1__.A,{onChange:newBorder=>{setBorder(newBorder),onChange(newBorder)},value:border,...props})};Template.displayName="Template";const Default=Template.bind({});Default.args={colors:[{name:"Blue 20",color:"#72aee6"},{name:"Blue 40",color:"#3582c4"},{name:"Red 40",color:"#e65054"},{name:"Red 70",color:"#8a2424"},{name:"Yellow 10",color:"#f2d675"},{name:"Yellow 40",color:"#bd8600"}],label:"Border",__next40pxDefaultSize:!0,enableAlpha:!0,enableStyle:!0,shouldSanitizeBorder:!0};const WithSlider=Template.bind({});WithSlider.args={...Default.args,withSlider:!0};const WithSliderCustomWidth=Template.bind({});WithSliderCustomWidth.args={...Default.args,withSlider:!0,width:"150px"},WithSliderCustomWidth.storyName="With Slider (Custom Width)";const IsCompact=Template.bind({});IsCompact.args={...Default.args,isCompact:!0};const WithMultipleOrigins=Template.bind({});WithMultipleOrigins.args={...Default.args,colors:[{name:"Default",colors:[{name:"Gray 20",color:"#a7aaad"},{name:"Gray 70",color:"#3c434a"}]},{name:"Theme",colors:[{name:"Blue 20",color:"#72aee6"},{name:"Blue 40",color:"#3582c4"},{name:"Blue 70",color:"#0a4b78"}]},{name:"User",colors:[{name:"Green",color:"#00a32a"},{name:"Yellow",color:"#f2d675"}]}]},Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"({\n  onChange,\n  ...props\n}) => {\n  const [border, setBorder] = useState<Border>();\n  const onChangeMerged: ComponentProps<typeof BorderControl>['onChange'] = newBorder => {\n    setBorder(newBorder);\n    onChange(newBorder);\n  };\n  return <BorderControl onChange={onChangeMerged} value={border} {...props} />;\n}",...Default.parameters?.docs?.source}}},WithSlider.parameters={...WithSlider.parameters,docs:{...WithSlider.parameters?.docs,source:{originalSource:"({\n  onChange,\n  ...props\n}) => {\n  const [border, setBorder] = useState<Border>();\n  const onChangeMerged: ComponentProps<typeof BorderControl>['onChange'] = newBorder => {\n    setBorder(newBorder);\n    onChange(newBorder);\n  };\n  return <BorderControl onChange={onChangeMerged} value={border} {...props} />;\n}",...WithSlider.parameters?.docs?.source},description:{story:"Render a slider beside the control.",...WithSlider.parameters?.docs?.description}}},WithSliderCustomWidth.parameters={...WithSliderCustomWidth.parameters,docs:{...WithSliderCustomWidth.parameters?.docs,source:{originalSource:"({\n  onChange,\n  ...props\n}) => {\n  const [border, setBorder] = useState<Border>();\n  const onChangeMerged: ComponentProps<typeof BorderControl>['onChange'] = newBorder => {\n    setBorder(newBorder);\n    onChange(newBorder);\n  };\n  return <BorderControl onChange={onChangeMerged} value={border} {...props} />;\n}",...WithSliderCustomWidth.parameters?.docs?.source},description:{story:"When rendering with a slider, the `width` prop is useful to customize the width of the number input.",...WithSliderCustomWidth.parameters?.docs?.description}}},IsCompact.parameters={...IsCompact.parameters,docs:{...IsCompact.parameters?.docs,source:{originalSource:"({\n  onChange,\n  ...props\n}) => {\n  const [border, setBorder] = useState<Border>();\n  const onChangeMerged: ComponentProps<typeof BorderControl>['onChange'] = newBorder => {\n    setBorder(newBorder);\n    onChange(newBorder);\n  };\n  return <BorderControl onChange={onChangeMerged} value={border} {...props} />;\n}",...IsCompact.parameters?.docs?.source},description:{story:"Restrict the width of the control and prevent it from expanding to take up additional space.\nWhen `true`, the `width` prop will be ignored.",...IsCompact.parameters?.docs?.description}}},WithMultipleOrigins.parameters={...WithMultipleOrigins.parameters,docs:{...WithMultipleOrigins.parameters?.docs,source:{originalSource:"({\n  onChange,\n  ...props\n}) => {\n  const [border, setBorder] = useState<Border>();\n  const onChangeMerged: ComponentProps<typeof BorderControl>['onChange'] = newBorder => {\n    setBorder(newBorder);\n    onChange(newBorder);\n  };\n  return <BorderControl onChange={onChangeMerged} value={border} {...props} />;\n}",...WithMultipleOrigins.parameters?.docs?.source},description:{story:"The `colors` object can contain multiple origins.",...WithMultipleOrigins.parameters?.docs?.description}}};try{WithSlider.displayName="WithSlider",WithSlider.__docgenInfo={description:"Render a slider beside the control.",displayName:"WithSlider",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/border-control/stories/index.story.tsx#WithSlider"]={docgenInfo:WithSlider.__docgenInfo,name:"WithSlider",path:"packages/components/src/border-control/stories/index.story.tsx#WithSlider"})}catch(__react_docgen_typescript_loader_error){}try{WithSliderCustomWidth.displayName="WithSliderCustomWidth",WithSliderCustomWidth.__docgenInfo={description:"When rendering with a slider, the `width` prop is useful to customize the width of the number input.",displayName:"WithSliderCustomWidth",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/border-control/stories/index.story.tsx#WithSliderCustomWidth"]={docgenInfo:WithSliderCustomWidth.__docgenInfo,name:"WithSliderCustomWidth",path:"packages/components/src/border-control/stories/index.story.tsx#WithSliderCustomWidth"})}catch(__react_docgen_typescript_loader_error){}try{IsCompact.displayName="IsCompact",IsCompact.__docgenInfo={description:"Restrict the width of the control and prevent it from expanding to take up additional space.\nWhen `true`, the `width` prop will be ignored.",displayName:"IsCompact",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/border-control/stories/index.story.tsx#IsCompact"]={docgenInfo:IsCompact.__docgenInfo,name:"IsCompact",path:"packages/components/src/border-control/stories/index.story.tsx#IsCompact"})}catch(__react_docgen_typescript_loader_error){}try{WithMultipleOrigins.displayName="WithMultipleOrigins",WithMultipleOrigins.__docgenInfo={description:"The `colors` object can contain multiple origins.",displayName:"WithMultipleOrigins",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/components/src/border-control/stories/index.story.tsx#WithMultipleOrigins"]={docgenInfo:WithMultipleOrigins.__docgenInfo,name:"WithMultipleOrigins",path:"packages/components/src/border-control/stories/index.story.tsx#WithMultipleOrigins"})}catch(__react_docgen_typescript_loader_error){}}}]);