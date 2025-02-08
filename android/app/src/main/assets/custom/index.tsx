interface Font{
    Bold: string;
    Regular:string;
    Light:string;
    LightItalic:string;
    Medium:string;

}
interface Fonts{
    Inter : Font,
    Poppins: Font
}

const fonts : Fonts = {
    Inter: {
      Bold: 'Inter-Bold',
      Regular: 'Inter-Regular',
      Light:'Inter-Light',
      LightItalic:'Inter-LightItalic',
      Medium:'Inter-Medium',
    },
    Poppins: {
      Regular: 'Poppins-Regular',
      Bold: 'Poppins-Bold',
      Light:'Poppins-Light',
      LightItalic:'Poppins-LightItalic',
      Medium:'Poppins-Medium',
    }
  };
  
  export default fonts;


// const fonts = {
//   Aventa: {
//     Bold: 'Aventa-Bold',
//     Regular: 'Aventa-Regular',
//     Light:'Aventa-Light',
//     LightItalic:'Aventa-LightItalic'

//   }
// };

// export default fonts;