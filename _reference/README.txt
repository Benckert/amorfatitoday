Material the page does not serve.

The leading underscore is doing real work: GitHub Pages runs Jekyll,
and Jekyll does not copy directories whose names begin with one. So
these files live with the project without being published at
amorfati.today, which is what images/README.txt and audio/README.txt
were doing before they moved here.

  text.jpg, text-cropped.png   the handwriting the verse was set from
  images.txt                   what each photograph is and how it is used
  audio.txt                    the ambient clip that was planned

If a .nojekyll file is ever added to the repository root, Jekyll stops
running and this folder starts being published again.
