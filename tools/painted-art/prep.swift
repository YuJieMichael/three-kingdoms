import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
// Trim, resize and encode one painted asset (design/art/art-bible.md §5).
// usage: prep <in.png> <out-base> <maxSide> <trim 0|1> <quality>  → writes <out-base>.avif and <out-base>.png, prints WxH
let a=CommandLine.arguments
let src=CGImageSourceCreateWithURL(URL(fileURLWithPath:a[1]) as CFURL,nil)!
let img=CGImageSourceCreateImageAtIndex(src,0,nil)!
let w=img.width,h=img.height
let cs=CGColorSpace(name:CGColorSpace.sRGB)!
let ctx=CGContext(data:nil,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:cs,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(img,in:CGRect(x:0,y:0,width:w,height:h))
var rect=CGRect(x:0,y:0,width:w,height:h)
if a[4]=="1"{
  let p=ctx.data!.bindMemory(to:UInt8.self,capacity:w*h*4)
  var minX=w,minY=h,maxX = -1,maxY = -1
  for y in 0..<h{for x in 0..<w{if p[(y*w+x)*4+3]>10{if x<minX{minX=x};if x>maxX{maxX=x};if y<minY{minY=y};if y>maxY{maxY=y}}}}
  let pad=6
  minX=max(0,minX-pad);minY=max(0,minY-pad);maxX=min(w-1,maxX+pad);maxY=min(h-1,maxY+pad)
  // bitmap rows run top-down in memory
  rect=CGRect(x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1)
}
let cropped=ctx.makeImage()!.cropping(to:rect)!
let maxSide=Double(a[3])!,scale=min(1.0,maxSide/Double(max(cropped.width,cropped.height)))
let ow=Int((Double(cropped.width)*scale).rounded()),oh=Int((Double(cropped.height)*scale).rounded())
let out=CGContext(data:nil,width:ow,height:oh,bitsPerComponent:8,bytesPerRow:ow*4,space:cs,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
out.interpolationQuality = .high
out.draw(cropped,in:CGRect(x:0,y:0,width:ow,height:oh))
let final=out.makeImage()!
for (ext,type) in [("avif","public.avif"),("png","public.png")]{
  let dst=CGImageDestinationCreateWithURL(URL(fileURLWithPath:a[2]+"."+ext) as CFURL,type as CFString,1,nil)!
  CGImageDestinationAddImage(dst,final,(ext=="avif" ? [kCGImageDestinationLossyCompressionQuality:Double(a[5])!] : [:]) as CFDictionary)
  if !CGImageDestinationFinalize(dst){FileHandle.standardError.write("cannot write \(ext)\n".data(using:.utf8)!);exit(1)}
}
print("\(ow)x\(oh)")
