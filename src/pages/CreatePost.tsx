import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {useState} from "react";
import Markdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {z} from "zod";

interface Props {
    content: string
}

const formSchema = z.object({
    content: z.string().min(1, {
        message: "Content must be not empty.",
    }),
})

export function DialogDemo(props: Props) {
    const [content, setContent] = useState<string>(props.content);
    const [fileMedia, setFileMedia] = useState<string | null>(null);
    const [removeSpace, setRemoveSpace] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: props.content
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        const myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer AQW1x39tRhFs6Utm044Brphx19yfFRHFmuS9-qtqDSI5knNvBhJZsTd5YmBQV6fyuQFlppWkE3PZBuxI06KNOWu8_dDPfc_QUtACK4XB94FXr_AHe-jELeAiiqr0T_We490VMuRlKPUXeVwUISB3u3GVNoDsfs4s1cDaeHWQGb0OKxg0NqK5prpqydnM1DE_BUUkgHIZLs5a6DZBaGpWM-MSDFza24bsrLxfzJW23vKyR-Y9ejtWehJwKocKGwFSmd_6XJ5NKMt5MDEftJOkwyRn8Um0AeBHwSlwB8I3QTtcnO6Y0oEb9ZolfG_ikOQfcFQtMzPX5S2wB0V6SSnRzYpfOSqX0Q");
        myHeaders.append("X-Restli-Protocol-Version", "2.0.0");
        myHeaders.append("LinkedIn-Version", "202502");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "lidc=\"b=TB72:s=T:r=T:a=T:p=T:g=4322:u=463:x=1:i=1740506362:t=1740510516:v=2:sig=AQEBuIDT9RMh8VbJ5UfeSKrnYSxmEPFO\"; __cf_bm=2qORzZUKQ2OW5UCtbBI0rbD9Rjf32mCGnoqLekNqPEA-1740505323-1.0.1.1-tYmes8R5obIEGrUUv0aRkNAYLgqEE8CDAAvKGBhhXdVY9.qLHX3.w.BU6.u.uKgOSC8M93vGQXH5THGfXFMHxw; bcookie=\"v=2&cb3c9924-61cc-4cab-8c81-4e9a1b60ac59\"; lang=v=2&lang=en-us; lidc=\"b=OGST07:s=O:r=O:a=O:p=O:g=3116:u=1:x=1:i=1740505323:t=1740591723:v=2:sig=AQGnEYHRH-GNBHDiX0SWdLx-BqzP4IZS\"");

        const raw = JSON.stringify({
            "author": "urn:li:person:1opTAUZVcq",
            "commentary": values.content,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
            },
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": false
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw
        };

        fetch("https://api.linkedin.com/rest/posts", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileMedia(reader.result as string);
                console.log(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Criar post</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[850px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <DialogHeader>
                            <DialogTitle>Create Post</DialogTitle>
                            <DialogDescription>
                                Create a post for Linkedin quickly, without leaving the website.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <Tabs defaultValue="post-content">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="post-content">Post Content</TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                </TabsList>
                                <TabsContent value="post-content">
                                    <Card>
                                        <CardContent className="space-y-2 mt-4">
                                            <div className="space-y-1">
                                                <FormField
                                                    control={form.control}
                                                    name="content"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Content</FormLabel>
                                                            <FormControl>
                                                                <Textarea {...field} className="h-[300px]" onChange={event => setContent(event.target.value)} id="content" placeholder="Content of post" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                                <Label htmlFor="media">Media</Label>
                                                <Input
                                                    id="media"
                                                    type="file"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="preview">
                                    <ScrollArea className="h-[400px] rounded-md border p-4">
                                <span className={removeSpace ? "" : "post-content"}>
                                    <Markdown>
                                        {content}
                                    </Markdown>
                                </span>
                                        {fileMedia && (
                                            <div className="mt-4">
                                                {fileMedia.startsWith("data:video") ? (
                                                    <video controls className="w-full">
                                                        <source src={fileMedia} type="video/mp4" />
                                                        Seu navegador não suporta vídeos.
                                                    </video>
                                                ) : (
                                                    <img src={fileMedia} alt="Uploaded media" className="w-full object-contain" />
                                                )}
                                            </div>
                                        )}
                                    </ScrollArea>

                                    <div className="flex items-center mt-3 space-x-2">
                                        <Checkbox checked={removeSpace} onCheckedChange={(checked) => setRemoveSpace(!!checked)} id="remove-space" />
                                        <label
                                            htmlFor="remove-space"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Remove spaces
                                        </label>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Post</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
